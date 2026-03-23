

## Problem

Archiving notifications **does work** at the database level (242 archived, 185 active). The real issue is that every inbound email creates a new `admin_notification`, resulting in massive duplicates:
- 42 notifications from `info@turno.com`
- 28 from `support@hospitable.com`  
- 27 "Work Order Assigned to You"
- 13 from `automated@airbnb.com`

When you archive one, dozens of identical-looking ones remain, making it appear that archiving doesn't work.

## Plan

### 1. Add bulk archive capability
- **NotificationsPage.tsx**: Add a "Archive Selected" button to the bulk actions bar (already has multi-select with checkboxes)
- **useNotifications.ts**: Add a `bulkArchive(ids: string[])` mutation that archives multiple notifications in one call
- Add an "Archive All" / "Clear All" button to quickly dismiss all visible notifications

### 2. Deduplicate email notifications  
- **resend-inbound-webhook** and **platform-inbound-webhook**: Before creating a new `admin_notification`, check if an unread notification with the same sender already exists within the last hour. If so, update the existing one's message/timestamp instead of creating a duplicate.
- This prevents the same sender from generating dozens of separate notifications.

### 3. Bulk cleanup of existing duplicates
- Run a one-time SQL cleanup to archive the 185 existing duplicate/noise notifications (turno.com, hospitable.com, pinterest.com, airbnb.com automated emails) so the inbox starts clean.

## Technical Details

**Bulk archive mutation** (useNotifications.ts):
```typescript
const bulkArchiveMutation = useMutation({
  mutationFn: async (ids: string[]) => {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_archived: true })
      .in('id', ids);
    if (error) throw error;
  },
  // optimistic update + invalidation
});
```

**Deduplication check** (edge functions):
Before inserting, query for an existing unread notification from the same sender within 1 hour. If found, update its `created_at` and append a count instead of inserting.

**Files to modify:**
- `src/hooks/useNotifications.ts` — add `bulkArchive` and `archiveAll` mutations
- `src/pages/admin/NotificationsPage.tsx` — add bulk archive UI buttons
- `src/components/admin/notifications/NotificationPanel.tsx` — add "Clear all" option
- `supabase/functions/resend-inbound-webhook/index.ts` — deduplicate notifications
- `supabase/functions/platform-inbound-webhook/index.ts` — deduplicate notifications

