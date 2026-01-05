-- Phase 4: Fix remaining service role policies
-- Ensure all service_role policies use correct syntax: TO service_role

-- Fix seam_access_codes service role policy
DROP POLICY IF EXISTS "Service role full access to seam_access_codes" ON public.seam_access_codes;
CREATE POLICY "Service role full access to seam_access_codes"
ON public.seam_access_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix seam_devices service role policy  
DROP POLICY IF EXISTS "Service role full access to seam_devices" ON public.seam_devices;
CREATE POLICY "Service role full access to seam_devices"
ON public.seam_devices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix seam_workspaces service role policy
DROP POLICY IF EXISTS "Service role full access to seam_workspaces" ON public.seam_workspaces;
CREATE POLICY "Service role full access to seam_workspaces"
ON public.seam_workspaces
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix device_events service role policy
DROP POLICY IF EXISTS "Service role full access to device_events" ON public.device_events;
CREATE POLICY "Service role full access to device_events"
ON public.device_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix device_configurations service role policy
DROP POLICY IF EXISTS "Service role full access to device_configurations" ON public.device_configurations;
CREATE POLICY "Service role full access to device_configurations"
ON public.device_configurations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix assistant_messages service role policy
DROP POLICY IF EXISTS "Service role full access to assistant_messages" ON public.assistant_messages;
CREATE POLICY "Service role full access to assistant_messages"
ON public.assistant_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix assistant_conversations service role policy
DROP POLICY IF EXISTS "Service role full access to assistant_conversations" ON public.assistant_conversations;
CREATE POLICY "Service role full access to assistant_conversations"
ON public.assistant_conversations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix assistant_escalations service role policy
DROP POLICY IF EXISTS "Service role full access to assistant_escalations" ON public.assistant_escalations;
CREATE POLICY "Service role full access to assistant_escalations"
ON public.assistant_escalations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix email_failures service role policy
DROP POLICY IF EXISTS "Service role full access to email_failures" ON public.email_failures;
CREATE POLICY "Service role full access to email_failures"
ON public.email_failures
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix calendar_sync_logs service role policy
DROP POLICY IF EXISTS "Service role full access to calendar_sync_logs" ON public.calendar_sync_logs;
CREATE POLICY "Service role full access to calendar_sync_logs"
ON public.calendar_sync_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix security_audit_logs service role policy
DROP POLICY IF EXISTS "Service role full access to security_audit_logs" ON public.security_audit_logs;
CREATE POLICY "Service role full access to security_audit_logs"
ON public.security_audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix application_logs service role policy
DROP POLICY IF EXISTS "Service role full access to application_logs" ON public.application_logs;
CREATE POLICY "Service role full access to application_logs"
ON public.application_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix error_logs service role policy
DROP POLICY IF EXISTS "Service role full access to error_logs" ON public.error_logs;
CREATE POLICY "Service role full access to error_logs"
ON public.error_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix api_status service role policy
DROP POLICY IF EXISTS "Service role full access to api_status" ON public.api_status;
CREATE POLICY "Service role full access to api_status"
ON public.api_status
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);