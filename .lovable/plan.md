

## Plan: Set Up Daily Digest Cron + Default All Preferences to Email Digest On

### 1. Schedule pg_cron Jobs for Daily Email

Use the Supabase SQL insert tool (not migration, since it contains project-specific URLs/keys) to:

- Enable `pg_cron` and `pg_net` extensions (if not already)
- Create two cron jobs:
  - **6:00 AM UTC**: `send-daily-notifications` (generates in-app notifications)
  - **6:05 AM UTC**: `send-daily-recap` (sends the digest email, runs 5 min after so notifications are ready)

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.schedule(
  'daily-notifications-6am',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://joiovubyokikqjytxtuv.supabase.co/functions/v1/send-daily-notifications',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'daily-recap-email-605am',
  '5 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://joiovubyokikqjytxtuv.supabase.co/functions/v1/send-daily-recap',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);
```

### 2. Default All Users' Preferences to Email Digest On

Update the `useNotificationPreferences` hook's `initializePreferences` logic — it already defaults `email_digest: true` for new preference rows. But we also need to:

- **Backfill existing preferences**: Run an UPDATE via the insert tool to set `email_digest = true` on all existing `notification_preferences` rows where it's currently false/null.
- **Auto-initialize on login**: Update the `NotificationPreferences` component or hook to call `initializePreferences()` automatically when preferences are loaded and some notification types are missing, ensuring all users get rows for every notification type with `email_digest: true`.

### 3. Update Default in Hook

In `useNotificationPreferences.ts`, the defaults already set `email_digest: true`. We'll also set `in_app: true` to ensure all channels default on. The `initializePreferences` mutation will be triggered automatically when the preferences page loads and missing types are detected.

### Files to modify
- **`src/hooks/useNotificationPreferences.ts`** — Add auto-initialization effect
- **`src/components/admin/notifications/NotificationPreferences.tsx`** — Call `initializePreferences` on mount when types are missing
- **SQL (insert tool)** — Backfill existing rows + create cron jobs

