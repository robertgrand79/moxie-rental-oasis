# Multi-Tenant Data Isolation Architecture

## Executive Summary

StayMoxie uses a **shared-database multi-tenant SaaS model** where all tenants share a single Supabase database with complete data isolation enforced through:

1. **Row Level Security (RLS) policies** - Database-level access control
2. **Organization-scoped data** - All tenant data linked via `organization_id`
3. **Helper functions** - Reusable security functions for policy enforcement
4. **Auto-population triggers** - Automatic organization assignment on insert

**Core Principle**: No tenant can ever access another tenant's data. Platform admins have cross-tenant visibility for support and management.

---

## Core Architecture

### Organization Model

```
┌─────────────────────────────────────────────────────────────┐
│                      organizations                          │
│  (Root tenant table - each row = one tenant)                │
├─────────────────────────────────────────────────────────────┤
│  id, name, slug, custom_domain, stripe_*, template_type...  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌────────────────┐ ┌──────────┐ ┌─────────────────┐
     │organization_   │ │properties│ │site_settings    │
     │members         │ │          │ │                 │
     └────────────────┘ └──────────┘ └─────────────────┘
              │               │
              ▼               ▼
     ┌────────────────┐ ┌──────────────────────────────┐
     │profiles        │ │reservations, work_orders,    │
     │                │ │availability_blocks, etc.     │
     └────────────────┘ └──────────────────────────────┘
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Root tenant entity with branding, Stripe config, domain settings |
| `organization_members` | Links users to organizations with roles (owner, admin, member) |
| `profiles` | User profile data, linked to organization via membership |

### Data Scoping Strategy

Nearly **100 tables** have an `organization_id` column linking them to a tenant:

```sql
-- Example table structure
CREATE TABLE public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),  -- Tenant link
    property_id UUID REFERENCES properties(id),
    title TEXT NOT NULL,
    -- ... other columns
);

-- Performance index
CREATE INDEX idx_work_orders_organization_id ON work_orders(organization_id);
```

---

## Row Level Security (RLS) Patterns

### Policy Categories

| Pattern | Description | Example Tables |
|---------|-------------|----------------|
| **Org Member View** | Any org member can SELECT | `properties`, `reservations`, `work_orders` |
| **Org Admin Manage** | Only org admins can INSERT/UPDATE/DELETE | `newsletter_campaigns`, `scheduled_messages` |
| **Platform Admin Only** | System tables, platform admins only | `system_roles`, `api_status`, `security_audit_logs` |
| **Owner Only** | Users can only access their own data | `profiles` (own profile) |
| **Service Role** | Edge functions with elevated access | `property_access_details` |

### Helper Functions

#### 1. `user_belongs_to_organization(user_id, org_id)`
Checks if user is a member of the organization (any role).

```sql
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(
    _user_id UUID, 
    _org_id UUID
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = _user_id AND organization_id = _org_id
    )
$$;
```

#### 2. `user_is_org_admin(user_id, org_id)`
Checks if user is an admin or owner of the organization.

```sql
CREATE OR REPLACE FUNCTION public.user_is_org_admin(
    _user_id UUID, 
    _org_id UUID
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = _user_id 
        AND organization_id = _org_id
        AND role IN ('admin', 'owner')
    )
$$;
```

#### 3. `is_platform_admin(user_id)`
Checks if user is a platform super admin (cross-tenant access).

```sql
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = _user_id AND is_super_admin = true
    )
$$;
```

### Policy Templates

#### Org Member View Policy
```sql
CREATE POLICY "Org members can view [table]"
ON public.[table] FOR SELECT
TO authenticated
USING (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
);
```

#### Org Admin Manage Policy
```sql
CREATE POLICY "Org admins can manage [table]"
ON public.[table] FOR ALL
TO authenticated
USING (
    user_is_org_admin(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
)
WITH CHECK (
    user_is_org_admin(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
);
```

#### Platform Admin Only Policy
```sql
CREATE POLICY "Platform admins can manage [table]"
ON public.[table] FOR ALL
TO authenticated
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));
```

#### Service Role Policy
```sql
CREATE POLICY "Service role full access"
ON public.[table] FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

## Auto-Population Triggers

### Purpose
Automatically set `organization_id` on INSERT to prevent null values and ensure data is always scoped.

### Trigger Functions

#### 1. From User Profile
For tables where the user is directly creating data:

```sql
CREATE OR REPLACE FUNCTION public.set_organization_id_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.organization_id IS NULL THEN
        SELECT p.organization_id INTO NEW.organization_id
        FROM profiles p
        WHERE p.id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$;

-- Apply to table
CREATE TRIGGER set_org_id_trigger
BEFORE INSERT ON public.some_table
FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_profile();
```

#### 2. From Property
For property-related tables:

```sql
CREATE OR REPLACE FUNCTION public.set_organization_id_from_property()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.organization_id IS NULL AND NEW.property_id IS NOT NULL THEN
        SELECT p.organization_id INTO NEW.organization_id
        FROM properties p
        WHERE p.id = NEW.property_id;
    END IF;
    RETURN NEW;
END;
$$;
```

#### 3. From Reservation
For reservation-related tables:

```sql
CREATE OR REPLACE FUNCTION public.set_organization_id_from_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.organization_id IS NULL AND NEW.reservation_id IS NOT NULL THEN
        SELECT r.organization_id INTO NEW.organization_id
        FROM reservations r
        WHERE r.id = NEW.reservation_id;
    END IF;
    RETURN NEW;
END;
$$;
```

---

## Special Cases

### Global Tables (No organization_id)

These tables intentionally lack `organization_id`:

| Table | Reason |
|-------|--------|
| `organizations` | Root tenant table itself |
| `platform_admins` | Cross-tenant admin access |
| `site_templates` | Shared templates for all tenants |
| `guest_profiles` | Global guest identity spans multiple orgs |
| `error_logs` | System-wide error tracking |
| `application_logs` | System-wide logging |

### `organizations_safe` View

A secure view that **redacts sensitive API keys**:

```sql
CREATE OR REPLACE VIEW public.organizations_safe AS
SELECT 
    id, name, slug, custom_domain, logo_url,
    -- Redact API keys, show only boolean flags
    (stripe_secret_key IS NOT NULL) AS has_stripe_configured,
    (seam_api_key IS NOT NULL) AS has_seam_configured,
    (pricelabs_api_key IS NOT NULL) AS has_pricelabs_configured
FROM organizations;

-- Uses SECURITY INVOKER to respect calling user's RLS
```

**Usage**: Frontend queries `organizations_safe` to display config status without exposing credentials.

### `guest_profiles` Special Case

Guest profiles are **intentionally global** to allow a single guest to book across multiple organizations:

```sql
-- RLS Policy Pattern
CREATE POLICY "Guests can view own profile"
ON public.guest_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Org admins can view related guest profiles"
ON public.guest_profiles FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT DISTINCT g.guest_profile_id
        FROM guests g
        JOIN property_reservations pr ON pr.id = g.reservation_id
        WHERE pr.organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    )
    OR is_platform_admin(auth.uid())
);
```

### Service Role Policies

For edge functions requiring elevated access:

```sql
CREATE POLICY "Service role can manage [table]"
ON public.[table] FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

**Important**: Service role policies should be rare and well-documented.

---

## Frontend Integration

### OrganizationContext

React context providing current organization throughout the app:

```typescript
// src/contexts/OrganizationContext.tsx
interface OrganizationContextType {
    organization: Organization | null;
    organizationId: string | null;
    isOrgAdmin: boolean;
    isOrgOwner: boolean;
    membership: OrganizationMember | null;
    isLoading: boolean;
}

// Usage in components
const { organizationId, isOrgAdmin } = useOrganization();
```

### Data Fetching Pattern

**All admin queries MUST filter by organization**:

```typescript
// ✅ CORRECT - Always filter by organizationId
const { data } = useQuery({
    queryKey: ['work-orders', organizationId],
    queryFn: async () => {
        const { data, error } = await supabase
            .from('work_orders')
            .select('*')
            .eq('organization_id', organizationId);
        if (error) throw error;
        return data;
    },
    enabled: !!organizationId,
});

// ❌ WRONG - Missing organization filter
const { data } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
        const { data } = await supabase
            .from('work_orders')
            .select('*');  // SECURITY RISK!
        return data;
    },
});
```

### Property-Based Filtering Pattern

For deeply nested data, fetch org properties first:

```typescript
// 1. Get organization's property IDs
const { data: properties } = useQuery({
    queryKey: ['properties', organizationId],
    queryFn: async () => {
        const { data } = await supabase
            .from('properties')
            .select('id')
            .eq('organization_id', organizationId);
        return data;
    },
    enabled: !!organizationId,
});

const propertyIds = properties?.map(p => p.id) ?? [];

// 2. Use property IDs to filter related data
const { data: reservations } = useQuery({
    queryKey: ['reservations', propertyIds],
    queryFn: async () => {
        const { data } = await supabase
            .from('reservations')
            .select('*')
            .in('property_id', propertyIds);
        return data;
    },
    enabled: propertyIds.length > 0,
});
```

---

## Domain Routing & Tenant Detection

### Subdomain Model

Tenants access their site via subdomains:

```
moxie.staymoxie.com  →  Extract "moxie" as org slug
acme.staymoxie.com   →  Extract "acme" as org slug
www.staymoxie.com    →  Platform marketing site
staymoxie.com        →  Platform marketing site
```

### `useTenantDetection` Hook

```typescript
// src/hooks/useTenantDetection.ts
export const useTenantDetection = () => {
    const hostname = window.location.hostname;
    
    // Check for subdomain pattern
    if (hostname.endsWith('.staymoxie.com')) {
        const subdomain = hostname.split('.')[0];
        if (subdomain !== 'www') {
            return { slug: subdomain, isSubdomain: true };
        }
    }
    
    // Check for custom domain
    // Query organizations where custom_domain = hostname
    
    return { slug: null, isSubdomain: false };
};
```

### Custom Domains

Organizations can configure custom domains:

```sql
UPDATE organizations 
SET custom_domain = 'booking.moxievacations.com'
WHERE slug = 'moxie';
```

The tenant detection hook checks `organizations.custom_domain` as a fallback.

### Session Management

**Critical cleanup on logout** to prevent tenant context mixing:

```typescript
// On logout
const handleLogout = async () => {
    // 1. Supabase signOut
    await supabase.auth.signOut();
    
    // 2. Clear localStorage (auth tokens)
    Object.keys(localStorage)
        .filter(key => key.startsWith('sb-'))
        .forEach(key => localStorage.removeItem(key));
    
    // 3. Clear sessionStorage (tenant context)
    sessionStorage.removeItem('current_tenant_slug');
    sessionStorage.removeItem('chat_session_id');
    sessionStorage.removeItem('client_id');
    
    // 4. Hard redirect to ensure clean state
    window.location.href = '/';
};
```

---

## Adding New Tables Checklist

When creating a new tenant-scoped table:

### 1. Add Organization Column
```sql
ALTER TABLE public.new_table 
ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

### 2. Create Index
```sql
CREATE INDEX idx_new_table_organization_id 
ON public.new_table(organization_id);
```

### 3. Enable RLS
```sql
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;
```

### 4. Create Policies
```sql
-- View policy
CREATE POLICY "Org members can view new_table"
ON public.new_table FOR SELECT TO authenticated
USING (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
);

-- Manage policy
CREATE POLICY "Org admins can manage new_table"
ON public.new_table FOR ALL TO authenticated
USING (
    user_is_org_admin(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
)
WITH CHECK (
    user_is_org_admin(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
);
```

### 5. Add Auto-Population Trigger (if needed)
```sql
CREATE TRIGGER set_new_table_org_id
BEFORE INSERT ON public.new_table
FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_profile();
```

### 6. Update Frontend Hooks
```typescript
// Filter by organizationId in all queries
.eq('organization_id', organizationId)
```

---

## Security Audit History

### Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Initial multi-tenant foundation, OrganizationContext | ✅ Complete |
| **Phase 2** | Add `organization_id` to ~50 tables | ✅ Complete |
| **Phase 3** | Add `organization_id` to remaining ~50 tables | ✅ Complete |
| **Phase 4** | Create org-scoped RLS policies | ✅ Complete |
| **Phase 5** | Add auto-population triggers | ✅ Complete |
| **Phase 6** | Drop legacy `is_admin()` policies | ✅ Complete |

### Security Scan Tools

- **Supabase Linter**: `supabase--linter` tool checks for RLS issues
- **Security Scan**: `security--run_security_scan` for comprehensive analysis
- **Policy Audit**: Query `pg_policies` view for policy review

### Key Security Decisions

1. **No generic `is_admin()` function** - Replaced with org-scoped `user_is_org_admin()`
2. **Platform admin explicit** - Uses `is_platform_admin()` for cross-tenant access
3. **Service role restricted** - Only edge functions use service role
4. **Guest profiles global** - Intentional design for cross-org guest identity
5. **API keys redacted** - `organizations_safe` view hides sensitive data

---

## Appendix: Quick Reference

### RLS Policy Quick Reference

```sql
-- User's own data
USING (user_id = auth.uid())

-- Org member access
USING (user_belongs_to_organization(auth.uid(), organization_id))

-- Org admin access
USING (user_is_org_admin(auth.uid(), organization_id))

-- Platform admin override
OR is_platform_admin(auth.uid())

-- Service role access
USING (auth.role() = 'service_role')
```

### Common Debugging Queries

```sql
-- Check user's organization memberships
SELECT * FROM organization_members WHERE user_id = '[user-id]';

-- Check if user is org admin
SELECT user_is_org_admin('[user-id]', '[org-id]');

-- Check if user is platform admin
SELECT is_platform_admin('[user-id]');

-- List all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'work_orders';
```

---

*Last Updated: January 2026*
*Security Audit: Phase 6 Complete*
