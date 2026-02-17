
# Database Query Optimization Plan for 200+ Tenant Scale

## Problem
With 200+ tenants sharing a single Supabase database, the current approach of making 12+ individual client-side queries per admin dashboard load (and similar patterns elsewhere) creates compounding pressure on the connection pool and increases latency. Several legacy hooks bypass React Query entirely, missing caching and deduplication. Key tables also lack indexes on `organization_id`.

---

## Phase 1: Add Missing Database Indexes

Several high-traffic tables queried on every dashboard load are missing `organization_id` indexes:

| Table | Currently Indexed? |
|---|---|
| `properties` | Yes |
| `blog_posts` | **No** |
| `places` | **No** |
| `lifestyle_gallery` | **No** |
| `newsletter_subscribers` | **No** |
| `property_reservations` | **No** |
| `reservations` | **No** |
| `testimonials` | Yes |
| `work_orders` | Yes |

**Action**: Create a single migration adding `btree` indexes on `organization_id` for each missing table. This is the highest-impact, lowest-risk change and will immediately improve query performance for every tenant.

---

## Phase 2: Consolidate Dashboard Queries into an Edge Function

Currently, `useDashboardStats` fires **12 parallel queries** and `useSimplifiedAnalytics` fires **8 more** -- all from the browser. At 200 tenants, that is up to 4,000 simultaneous connections just for dashboard loads.

**Action**: Create a new Edge Function `get-dashboard-stats` that:
- Accepts `organization_id` as input
- Runs all 12+ count/aggregate queries server-side in a single database round-trip using a single SQL query with CTEs (Common Table Expressions)
- Returns a single JSON payload with all dashboard stats
- Reduces 20 client-side queries to 1 Edge Function call

**Frontend changes**:
- Replace `useDashboardStats` internals to call the Edge Function via `supabase.functions.invoke('get-dashboard-stats')`
- Replace `useSimplifiedAnalytics` similarly, or merge both into a single hook that calls the Edge Function once
- Keep the same React Query caching (30s stale time) on the frontend

```text
Before:                          After:
Browser --[12 queries]--> DB     Browser --[1 call]--> Edge Fn --[1 SQL]--> DB
Browser --[8 queries]---> DB     
= 20 connections per load        = 1 connection per load
```

---

## Phase 3: Migrate Legacy Hooks to React Query

Three hooks still use raw `useState`/`useEffect` patterns, which means:
- No automatic cache deduplication (multiple components = multiple fetches)
- No stale-while-revalidate
- No background refetching

**Hooks to migrate**:

| Hook | Current Pattern | Impact |
|---|---|---|
| `usePropertyFetch` | `useState` + `useCallback` + `useEffect` | Used across admin; duplicated fetches |
| `usePaginatedProperties` | `useState` + `useEffect` | No cache sharing with `usePropertyFetch` |
| `useWorkOrderManagement` | `useState` + `Promise.all` | Complex state, no cache |
| `useChecklistManagement` | `useState` + `Promise.all` | Waterfall sub-queries |
| `useTaskManagement` | `useState` + `Promise.all` | No cache |

**Action**: Rewrite each hook to use `useQuery` / `useInfiniteQuery` with:
- Organization-scoped query keys (e.g., `['properties', organizationId]`)
- 2-5 minute `staleTime` depending on data volatility
- `enabled` flag gated on `organizationId` availability

This ensures that if 3 components use `usePropertyFetch`, only 1 actual network request fires.

---

## Phase 4: Public Data Caching Layer

Guest-facing (tenant website) data like blog posts, testimonials, gallery items, and settings rarely change but are fetched on every page load by every visitor. At scale, this is the highest-volume query source.

**Action**:
- Increase `staleTime` for public tenant hooks to **10 minutes** (from current 2 minutes):
  - `useTenantProperties` (currently 2 min)
  - `useTenantSettings` (currently 5 min)
  - `useTenantPointsOfInterest` (currently 2 min)
  - `useTenantLifestyleGallery` (currently 2 min)
- Add a `gcTime` of **30 minutes** so cached data persists across navigation
- For the most static data (settings, meta tags, navigation config), increase to **30 minute** stale time since these change only when an admin saves
- Optionally add a cache-busting mechanism: when an admin saves settings, invalidate the relevant query key so the next visitor gets fresh data

---

## Phase 5 (Future): Materialized Views for Dashboard Statistics

This is a longer-term optimization that becomes valuable when dashboard queries start taking noticeable time even with indexes.

**Concept**: Create a PostgreSQL materialized view `dashboard_stats_mv` that pre-computes all counts per organization. Refresh it on a schedule (every 5 minutes via `pg_cron`).

**Why defer**: The Edge Function from Phase 2 with proper indexes from Phase 1 should handle 200-500 tenants comfortably. Materialized views add operational complexity (refresh scheduling, staleness tradeoffs) and should only be introduced when actual query latency warrants it.

---

## Implementation Order

| Step | Phase | Risk | Effort | Impact |
|---|---|---|---|---|
| 1 | Indexes | Very low | Small | High -- immediate query speedup |
| 2 | Edge Function | Low | Medium | High -- 20x fewer connections per dashboard |
| 3 | React Query migration | Low | Medium | Medium -- deduplication + caching |
| 4 | Public caching | Very low | Small | Medium -- reduces guest-facing load |
| 5 | Materialized views | Medium | Large | Deferred until needed |

## Technical Details

**Edge Function SQL (Phase 2 example)**:
```text
WITH props AS (
  SELECT id FROM properties WHERE organization_id = $1
),
prop_count AS (SELECT count(*) FROM props),
blog_total AS (SELECT count(*) FROM blog_posts WHERE organization_id = $1),
blog_published AS (SELECT count(*) FROM blog_posts WHERE organization_id = $1 AND status = 'published'),
...
SELECT json_build_object(
  'properties_total', (SELECT * FROM prop_count),
  'blog_total', (SELECT * FROM blog_total),
  ...
)
```

This runs as a single query plan on the database, using only 1 connection instead of 12+.

**React Query migration pattern (Phase 3)**:
```text
// Before (usePropertyFetch):
useState + useCallback + useEffect -> direct supabase call

// After:
useQuery({
  queryKey: ['properties', organizationId],
  queryFn: () => supabase.from('properties')...
  enabled: !!organizationId,
  staleTime: 2 * 60 * 1000,
})
```
