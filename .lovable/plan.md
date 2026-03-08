

## Diagnosis

- **`property_reservations`**: 0 records. This is the "enterprise" table used by the entire UI (18 files), with `cleaning_status`, `cleaning_work_order_id`, Stripe fields, `check_in_instructions`, etc.
- **`reservations`**: 5,000 records for Test Org (`297f9511-...`), all on "Scale Test Property", all `confirmed` status. Missing enterprise columns.
- The UI correctly queries `property_reservations` -- the data just isn't there yet.

## Plan

### 1. Migrate 5,000 test bookings into `property_reservations`

SQL migration to INSERT from `reservations` into `property_reservations`, mapping shared columns and defaulting enterprise-only columns:

```text
reservations column        → property_reservations column
─────────────────────────────────────────────────────────
id, property_id, guest_name, guest_email, guest_phone,
check_in_date, check_out_date, guest_count, total_amount,
booking_status, payment_status, stripe_session_id,
stripe_payment_intent_id, organization_id, special_instructions
                           → mapped directly (special_instructions → special_requests)

(missing in reservations)  → cleaning_status defaults to 'pending'
                           → currency defaults to 'USD'
                           → source_platform copied from external_platform
```

Only migrates records where the `id` doesn't already exist in `property_reservations` (idempotent).

### 2. Add server-side pagination to ModernBookingManagement

Currently capped at `.range(0, 49)` with no way to page forward. Changes:
- Add `currentPage` state and use `.range(page * 50, (page + 1) * 50 - 1)`
- Use `{ count: 'exact' }` in the Supabase select to get total count
- Add the existing `PaginationControls` component below the booking list
- Stats cards will use a separate lightweight count query grouped by `booking_status` so totals reflect all 5,000 records, not just the current page

### 3. Fix stats to query full dataset

Replace the in-memory `useMemo` stats with a parallel Supabase query:
```sql
SELECT booking_status, count(*), sum(total_amount)
FROM property_reservations
WHERE organization_id = ?
GROUP BY booking_status
```

This gives accurate totals across all records regardless of pagination page.

### Files to modify
- **New SQL migration** -- migrate reservations → property_reservations
- **`src/components/admin/host/ModernBookingManagement.tsx`** -- pagination state, count query, PaginationControls integration, stats from DB
- **`src/hooks/useBookingData.ts`** -- no changes needed (already targets property_reservations)

