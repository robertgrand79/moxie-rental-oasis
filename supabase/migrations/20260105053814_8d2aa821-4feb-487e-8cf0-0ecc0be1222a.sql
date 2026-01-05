-- Phase 6C: Final cleanup of remaining legacy is_admin() policies
-- These were missed in previous migrations

-- ========================================
-- ai_analytics - already has platform admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can view analytics" ON public.ai_analytics;

-- ========================================
-- configuration_audit_log - already has org member policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.configuration_audit_log;

-- ========================================
-- content_approval_items
-- ========================================
DROP POLICY IF EXISTS "Admins can insert content approval items" ON public.content_approval_items;

-- Create org-scoped insert policy
CREATE POLICY "Org admins can insert content approval items"
ON public.content_approval_items FOR INSERT TO authenticated
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

-- ========================================
-- eugene_events - already has org admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can manage events" ON public.eugene_events;

-- ========================================
-- guest_notifications - already has org admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.guest_notifications;

-- ========================================
-- guest_support_chats - already has org admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can manage all support chats" ON public.guest_support_chats;

-- ========================================
-- guest_support_messages
-- ========================================
DROP POLICY IF EXISTS "Users can send messages in their chats" ON public.guest_support_messages;

-- Create proper org-scoped insert policy
CREATE POLICY "Users and org admins can send support messages"
ON public.guest_support_messages FOR INSERT TO authenticated
WITH CHECK (
  chat_id IN (
    SELECT id FROM public.guest_support_chats
    WHERE guest_profile_id IN (
      SELECT id FROM public.guest_profiles WHERE user_id = auth.uid()
    )
  )
  OR public.is_platform_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.guest_support_chats gsc
    WHERE gsc.id = guest_support_messages.chat_id
    AND public.user_is_org_admin(auth.uid(), gsc.organization_id)
  )
);

-- ========================================
-- image_optimization_settings - already has platform admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admin manage optimization settings" ON public.image_optimization_settings;

-- ========================================
-- image_performance_metrics - already has platform admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admin manage image performance metrics" ON public.image_performance_metrics;

-- ========================================
-- image_transformations - already has platform admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admin update image transformations" ON public.image_transformations;
DROP POLICY IF EXISTS "Admin insert image transformations" ON public.image_transformations;

-- ========================================
-- newsletter_analytics - already has org member policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can view all newsletter analytics" ON public.newsletter_analytics;

-- ========================================
-- newsletter_campaigns - already has org admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can manage all campaigns" ON public.newsletter_campaigns;

-- ========================================
-- newsletter_click_tracking - already has org member policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can view all click tracking" ON public.newsletter_click_tracking;

-- ========================================
-- property_analytics - already has org member policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can manage property analytics" ON public.property_analytics;

-- ========================================
-- system_permissions - already has platform admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can manage all permissions" ON public.system_permissions;

-- ========================================
-- system_roles - already has platform admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.system_roles;

-- ========================================
-- turno_sync_log - already has platform admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can manage all sync logs" ON public.turno_sync_log;

-- ========================================
-- user_audit_logs - already has platform admin policy from Phase 6
-- ========================================
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.user_audit_logs;
DROP POLICY IF EXISTS "Admins can create audit logs" ON public.user_audit_logs;

-- Create platform admin insert policy for user_audit_logs
CREATE POLICY "Platform admins can insert user audit logs"
ON public.user_audit_logs FOR INSERT TO authenticated
WITH CHECK (public.is_platform_admin(auth.uid()));