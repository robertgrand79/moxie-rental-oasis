-- 1. RLS Policy for error logs updates by platform admins
CREATE POLICY "Platform admins can update error logs" ON public.error_logs 
  FOR UPDATE 
  USING (public.is_platform_admin(auth.uid())) 
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- 2. Multi-tenant RLS Isolation Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_organization_id 
  ON public.blog_posts(organization_id);

CREATE INDEX IF NOT EXISTS idx_lifestyle_gallery_organization_id 
  ON public.lifestyle_gallery(organization_id);

CREATE INDEX IF NOT EXISTS idx_contractors_organization_id 
  ON public.contractors(organization_id);

CREATE INDEX IF NOT EXISTS idx_reservations_organization_id 
  ON public.reservations(organization_id);

CREATE INDEX IF NOT EXISTS idx_property_reservations_organization_id 
  ON public.property_reservations(organization_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_organization_id 
  ON public.chat_sessions(organization_id);

CREATE INDEX IF NOT EXISTS idx_community_updates_organization_id 
  ON public.community_updates(organization_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_organization_id 
  ON public.newsletter_subscribers(organization_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_organization_id 
  ON public.newsletter_campaigns(organization_id);

CREATE INDEX IF NOT EXISTS idx_tax_rates_organization_id 
  ON public.tax_rates(organization_id);

CREATE INDEX IF NOT EXISTS idx_seam_workspaces_organization_id 
  ON public.seam_workspaces(organization_id);

-- 3. Foreign Key & Query Path Indexes
CREATE INDEX IF NOT EXISTS idx_property_reservations_property_id 
  ON public.property_reservations(property_id);

CREATE INDEX IF NOT EXISTS idx_property_reservations_guest_email 
  ON public.property_reservations(guest_email);

CREATE INDEX IF NOT EXISTS idx_guest_communications_reservation_id 
  ON public.guest_communications(reservation_id);

CREATE INDEX IF NOT EXISTS idx_property_analytics_property_id 
  ON public.property_analytics(property_id);

CREATE INDEX IF NOT EXISTS idx_testimonials_property_id 
  ON public.testimonials(property_id);
