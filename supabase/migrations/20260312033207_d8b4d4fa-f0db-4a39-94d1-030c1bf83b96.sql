-- Backfill all existing notification preferences to have email_digest and in_app enabled
UPDATE public.notification_preferences
SET email_digest = true, in_app = true, updated_at = now()
WHERE email_digest = false OR in_app = false;