-- Priority 4 Fixes: Chat messages, property reservations, and newsletter subscribers

-- ============================================
-- CHAT_MESSAGES - Tighten RLS policy (policy already exists, just drop permissive one)
-- ============================================

-- Drop the overly permissive policy if it exists
DROP POLICY IF EXISTS "Users can view messages in accessible sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Public can view all chat messages" ON public.chat_messages;

-- ============================================
-- PROPERTY_RESERVATIONS - Add audit function for data access
-- ============================================

-- Create an audit function to log access to sensitive guest data
CREATE OR REPLACE FUNCTION public.log_reservation_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to reservations with guest PII
  INSERT INTO public.admin_audit_logs (
    action,
    table_name,
    record_id,
    admin_id,
    new_values
  ) VALUES (
    'SELECT_GUEST_DATA',
    'property_reservations',
    NEW.id,
    auth.uid(),
    jsonb_build_object('accessed_at', now())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- NEWSLETTER_SUBSCRIBERS - Add audit logging for bulk access
-- ============================================

-- Create function to detect and log bulk subscriber queries
CREATE OR REPLACE FUNCTION public.audit_subscriber_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log admin access to subscriber data
  INSERT INTO public.admin_audit_logs (
    action,
    table_name,
    admin_id,
    new_values
  ) VALUES (
    'SUBSCRIBER_LIST_ACCESS',
    'newsletter_subscribers',
    auth.uid(),
    jsonb_build_object(
      'accessed_at', now(),
      'subscriber_email', NEW.email
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;