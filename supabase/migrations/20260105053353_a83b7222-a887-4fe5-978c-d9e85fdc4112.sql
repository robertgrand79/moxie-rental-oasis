-- Phase 6: Complete Legacy is_admin() Policy Cleanup
-- Ensures strict tenant isolation across all tables
-- Removes 60+ legacy is_admin() policies

-- ========================================
-- PART A: Drop legacy policies on tables with existing org-scoped replacements (17 tables)
-- ========================================

-- content_approval_items
DROP POLICY IF EXISTS "Admins can update content approval items" ON public.content_approval_items;
DROP POLICY IF EXISTS "Admins can view content approval items" ON public.content_approval_items;

-- guests
DROP POLICY IF EXISTS "Authenticated admins can manage all guests" ON public.guests;

-- newsletter_subscribers (multiple legacy policies)
DROP POLICY IF EXISTS "Admins can delete newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can insert newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;

-- office_rentals
DROP POLICY IF EXISTS "Admins can delete office rentals" ON public.office_rentals;
DROP POLICY IF EXISTS "Admins can insert office rentals" ON public.office_rentals;
DROP POLICY IF EXISTS "Admins can update office rentals" ON public.office_rentals;

-- office_spaces
DROP POLICY IF EXISTS "Admins can manage office spaces" ON public.office_spaces;
DROP POLICY IF EXISTS "Admins can view office spaces" ON public.office_spaces;

-- pricing_rules
DROP POLICY IF EXISTS "Admins can manage pricing rules" ON public.pricing_rules;

-- profiles
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;

-- properties
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;

-- property_fees
DROP POLICY IF EXISTS "Admins can manage property fees" ON public.property_fees;

-- property_reservations
DROP POLICY IF EXISTS "Admins can manage all reservations" ON public.property_reservations;

-- property_stripe_credentials
DROP POLICY IF EXISTS "Admins can manage all stripe credentials" ON public.property_stripe_credentials;

-- seam_access_codes
DROP POLICY IF EXISTS "Admins can manage seam access codes" ON public.seam_access_codes;

-- seam_devices
DROP POLICY IF EXISTS "Admins can manage seam devices" ON public.seam_devices;

-- testimonials
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;

-- tour_requests
DROP POLICY IF EXISTS "Admins can delete tour requests" ON public.tour_requests;
DROP POLICY IF EXISTS "Admins can update tour requests" ON public.tour_requests;
DROP POLICY IF EXISTS "Admins can view tour requests" ON public.tour_requests;

-- user_invitations
DROP POLICY IF EXISTS "Admins can manage user invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can view user invitations" ON public.user_invitations;

-- work_orders
DROP POLICY IF EXISTS "Admins can delete work orders" ON public.work_orders;

-- ========================================
-- PART B: Org-scoped tables - Create new policies, then drop legacy (16 tables)
-- ========================================

-- chat_messages
CREATE POLICY "Org members can view chat messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage chat messages"
ON public.chat_messages FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;

-- configuration_audit_log
CREATE POLICY "Org members can view configuration audit logs"
ON public.configuration_audit_log FOR SELECT TO authenticated
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can view configuration audit log" ON public.configuration_audit_log;

-- device_events
CREATE POLICY "Org members can view device events"
ON public.device_events FOR SELECT TO authenticated
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can view device events" ON public.device_events;

-- device_maintenance_alerts
CREATE POLICY "Org admins can manage device maintenance alerts"
ON public.device_maintenance_alerts FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage maintenance alerts" ON public.device_maintenance_alerts;

-- eugene_events
CREATE POLICY "Org admins can manage eugene events"
ON public.eugene_events FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage eugene events" ON public.eugene_events;

-- guest_notifications
CREATE POLICY "Org admins can manage guest notifications"
ON public.guest_notifications FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage guest notifications" ON public.guest_notifications;

-- guest_support_chats
CREATE POLICY "Org admins can manage guest support chats"
ON public.guest_support_chats FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage support chats" ON public.guest_support_chats;

-- newsletter_analytics
CREATE POLICY "Org members can view newsletter analytics"
ON public.newsletter_analytics FOR SELECT TO authenticated
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can view newsletter analytics" ON public.newsletter_analytics;

-- newsletter_campaigns
CREATE POLICY "Org admins can manage newsletter campaigns"
ON public.newsletter_campaigns FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage newsletter campaigns" ON public.newsletter_campaigns;

-- newsletter_click_tracking
CREATE POLICY "Org members can view newsletter click tracking"
ON public.newsletter_click_tracking FOR SELECT TO authenticated
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can view click tracking" ON public.newsletter_click_tracking;

-- places
CREATE POLICY "Org admins can manage places"
ON public.places FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage places" ON public.places;

-- property_analytics
CREATE POLICY "Org members can view property analytics"
ON public.property_analytics FOR SELECT TO authenticated
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can view property analytics" ON public.property_analytics;

-- scheduled_messages
CREATE POLICY "Org admins can manage scheduled messages"
ON public.scheduled_messages FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage scheduled messages" ON public.scheduled_messages;

-- setup_tokens
CREATE POLICY "Org admins can manage setup tokens"
ON public.setup_tokens FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage setup tokens" ON public.setup_tokens;

-- sync_logs
CREATE POLICY "Org members can view sync logs"
ON public.sync_logs FOR SELECT TO authenticated
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can view sync logs" ON public.sync_logs;

-- sync_metadata
CREATE POLICY "Org admins can manage sync metadata"
ON public.sync_metadata FOR ALL TO authenticated
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage sync metadata" ON public.sync_metadata;

-- ========================================
-- PART C: Platform admin tables (14 tables)
-- Replace is_admin() with is_platform_admin() for system-level tables
-- ========================================

-- admin_audit_logs
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Platform admins can view admin audit logs"
ON public.admin_audit_logs FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- ai_analytics
DROP POLICY IF EXISTS "Admins can manage AI analytics" ON public.ai_analytics;
CREATE POLICY "Platform admins can manage AI analytics"
ON public.ai_analytics FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- api_status
DROP POLICY IF EXISTS "Admins can manage API status" ON public.api_status;
CREATE POLICY "Platform admins can manage API status"
ON public.api_status FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- image_optimization_settings
DROP POLICY IF EXISTS "Admins can manage image optimization settings" ON public.image_optimization_settings;
CREATE POLICY "Platform admins can manage image optimization settings"
ON public.image_optimization_settings FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- image_performance_metrics
DROP POLICY IF EXISTS "Admins can manage image performance metrics" ON public.image_performance_metrics;
CREATE POLICY "Platform admins can manage image performance metrics"
ON public.image_performance_metrics FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- image_transformations
DROP POLICY IF EXISTS "Admins can update image transformations" ON public.image_transformations;
CREATE POLICY "Platform admins can manage image transformations"
ON public.image_transformations FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- permission_audit_logs
DROP POLICY IF EXISTS "Admins can view permission audit logs" ON public.permission_audit_logs;
CREATE POLICY "Platform admins can view permission audit logs"
ON public.permission_audit_logs FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- role_permissions
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Platform admins can manage role permissions"
ON public.role_permissions FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- security_audit_logs
DROP POLICY IF EXISTS "Admins can view security audit logs" ON public.security_audit_logs;
CREATE POLICY "Platform admins can view security audit logs"
ON public.security_audit_logs FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- system_permissions
DROP POLICY IF EXISTS "Admins can manage system permissions" ON public.system_permissions;
CREATE POLICY "Platform admins can manage system permissions"
ON public.system_permissions FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- system_roles
DROP POLICY IF EXISTS "Admins can manage system roles" ON public.system_roles;
CREATE POLICY "Platform admins can manage system roles"
ON public.system_roles FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- turno_sync_log
DROP POLICY IF EXISTS "Admins can manage turno sync log" ON public.turno_sync_log;
CREATE POLICY "Platform admins can manage turno sync log"
ON public.turno_sync_log FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- user_audit_logs
DROP POLICY IF EXISTS "Admins can view user audit logs" ON public.user_audit_logs;
CREATE POLICY "Platform admins can view user audit logs"
ON public.user_audit_logs FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Platform admins can manage user roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- ========================================
-- PART D: Fix compound policies (5 tables)
-- Update OR is_admin() to use proper scoping
-- ========================================

-- guest_support_messages - fix compound policy
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.guest_support_messages;
CREATE POLICY "Users and org admins can view support messages"
ON public.guest_support_messages FOR SELECT TO authenticated
USING (
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

-- maintenance_checklist_items - drop legacy policy
DROP POLICY IF EXISTS "Admins and owners can manage checklist items" ON public.maintenance_checklist_items;

-- property_checklist_item_completions - already has org check, drop legacy
DROP POLICY IF EXISTS "Admins can manage checklist completions" ON public.property_checklist_item_completions;

-- property_checklist_runs - already has org check, drop legacy
DROP POLICY IF EXISTS "Admins can manage checklist runs" ON public.property_checklist_runs;

-- reservations - drop legacy, org-scoped already exists
DROP POLICY IF EXISTS "Admins can manage all reservations" ON public.reservations;

-- ========================================
-- PART E: guest_profiles tenant isolation
-- Note: guest_profiles is intentionally global per architecture decision
-- A single guest can span multiple organizations
-- ========================================

DROP POLICY IF EXISTS "Admins can manage all guest profiles" ON public.guest_profiles;
DROP POLICY IF EXISTS "Admins can view all guest profiles" ON public.guest_profiles;

-- Platform admins can manage all guest profiles
CREATE POLICY "Platform admins can manage guest profiles"
ON public.guest_profiles FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Org admins can view guest profiles for guests with reservations in their org
-- guests.reservation_id -> reservations.id -> reservations.property_id -> properties.organization_id
CREATE POLICY "Org admins can view org guest profiles"
ON public.guest_profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.guests g
    JOIN public.reservations r ON r.id = g.reservation_id
    JOIN public.properties p ON p.id = r.property_id
    WHERE g.email = guest_profiles.email
    AND public.user_is_org_admin(auth.uid(), p.organization_id)
  )
);