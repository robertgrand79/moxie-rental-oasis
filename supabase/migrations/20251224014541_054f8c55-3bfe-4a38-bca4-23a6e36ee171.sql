-- Fix user deletion failures caused by admin audit logs referencing auth.users
-- Strategy: keep audit logs, but allow referenced user/profile to be deleted by setting admin_id to NULL.

ALTER TABLE public.admin_audit_logs
  DROP CONSTRAINT IF EXISTS admin_audit_logs_admin_id_fkey;

ALTER TABLE public.admin_audit_logs
  ADD CONSTRAINT admin_audit_logs_admin_id_fkey
  FOREIGN KEY (admin_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- Performance: common query filter by admin_id
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id
  ON public.admin_audit_logs (admin_id);