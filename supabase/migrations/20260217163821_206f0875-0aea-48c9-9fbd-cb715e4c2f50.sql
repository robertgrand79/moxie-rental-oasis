-- Phase 1: Add missing organization_id indexes for high-traffic tables
-- These indexes dramatically improve query performance for tenant-scoped queries

CREATE INDEX IF NOT EXISTS idx_blog_posts_organization_id ON public.blog_posts USING btree (organization_id);
CREATE INDEX IF NOT EXISTS idx_places_organization_id ON public.places USING btree (organization_id);
CREATE INDEX IF NOT EXISTS idx_lifestyle_gallery_organization_id ON public.lifestyle_gallery USING btree (organization_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_organization_id ON public.newsletter_subscribers USING btree (organization_id);
CREATE INDEX IF NOT EXISTS idx_property_reservations_organization_id ON public.property_reservations USING btree (organization_id);
CREATE INDEX IF NOT EXISTS idx_reservations_organization_id ON public.reservations USING btree (organization_id);

-- Composite indexes for common filtered queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_org_status ON public.blog_posts USING btree (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_lifestyle_gallery_org_active ON public.lifestyle_gallery USING btree (organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_places_org_active_map ON public.places USING btree (organization_id, is_active, show_on_map);
CREATE INDEX IF NOT EXISTS idx_property_reservations_property_checkin ON public.property_reservations USING btree (property_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_property_reservations_property_checkout ON public.property_reservations USING btree (property_id, check_out_date);