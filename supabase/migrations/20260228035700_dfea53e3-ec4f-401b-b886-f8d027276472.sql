
-- ============================================================
-- Phase 5: Materialized View for Dashboard Statistics
-- ============================================================

-- 1. Create the Materialized View with pre-computed org stats
CREATE MATERIALIZED VIEW IF NOT EXISTS public.organization_stats_summary AS
WITH prop_counts AS (
  SELECT organization_id, count(*) AS total_properties
  FROM properties
  GROUP BY organization_id
),
blog_counts AS (
  SELECT 
    organization_id,
    count(*) AS total_blog_posts,
    count(*) FILTER (WHERE status = 'published') AS published_blog_posts
  FROM blog_posts
  GROUP BY organization_id
),
poi_counts AS (
  SELECT 
    organization_id,
    count(*) AS total_pois,
    count(*) FILTER (WHERE is_featured = true) AS featured_pois
  FROM places
  GROUP BY organization_id
),
gallery_counts AS (
  SELECT 
    organization_id,
    count(*) AS total_gallery_items,
    count(*) FILTER (WHERE is_featured = true) AS featured_gallery_items
  FROM lifestyle_gallery
  GROUP BY organization_id
),
subscriber_counts AS (
  SELECT
    organization_id,
    count(*) FILTER (WHERE is_active = true AND email_opt_in = true) AS total_subscribers,
    count(*) FILTER (
      WHERE is_active = true 
      AND subscribed_at >= date_trunc('month', now())
    ) AS subscribers_this_month
  FROM newsletter_subscribers
  GROUP BY organization_id
),
testimonial_stats AS (
  SELECT 
    organization_id,
    count(*) AS total_testimonials,
    count(*) FILTER (WHERE is_featured = true) AS featured_testimonials,
    avg(rating) FILTER (WHERE is_active = true) AS average_rating,
    count(*) FILTER (WHERE is_active = true) AS total_reviews
  FROM testimonials
  GROUP BY organization_id
),
reservation_stats AS (
  SELECT
    organization_id,
    count(*) FILTER (
      WHERE check_in_date = CURRENT_DATE AND booking_status = 'confirmed'
    ) AS check_ins_today,
    count(*) FILTER (
      WHERE check_out_date = CURRENT_DATE AND booking_status = 'confirmed'
    ) AS check_outs_today,
    count(*) FILTER (
      WHERE created_at >= date_trunc('month', now())
    ) AS bookings_this_month,
    coalesce(sum(total_amount) FILTER (
      WHERE created_at >= date_trunc('month', now()) AND booking_status = 'confirmed'
    ), 0) AS revenue_this_month
  FROM property_reservations
  GROUP BY organization_id
),
work_order_stats AS (
  SELECT
    organization_id,
    count(*) FILTER (WHERE status IN ('pending', 'in_progress')) AS open_work_orders
  FROM work_orders
  GROUP BY organization_id
)
SELECT
  o.id AS organization_id,
  coalesce(p.total_properties, 0)::int AS total_properties,
  coalesce(b.total_blog_posts, 0)::int AS total_blog_posts,
  coalesce(b.published_blog_posts, 0)::int AS published_blog_posts,
  coalesce(poi.total_pois, 0)::int AS total_pois,
  coalesce(poi.featured_pois, 0)::int AS featured_pois,
  coalesce(g.total_gallery_items, 0)::int AS total_gallery_items,
  coalesce(g.featured_gallery_items, 0)::int AS featured_gallery_items,
  coalesce(s.total_subscribers, 0)::int AS total_subscribers,
  coalesce(s.subscribers_this_month, 0)::int AS subscribers_this_month,
  coalesce(t.total_testimonials, 0)::int AS total_testimonials,
  coalesce(t.featured_testimonials, 0)::int AS featured_testimonials,
  t.average_rating,
  coalesce(t.total_reviews, 0)::int AS total_reviews,
  coalesce(r.check_ins_today, 0)::int AS check_ins_today,
  coalesce(r.check_outs_today, 0)::int AS check_outs_today,
  coalesce(r.bookings_this_month, 0)::int AS bookings_this_month,
  coalesce(r.revenue_this_month, 0)::numeric AS revenue_this_month,
  coalesce(w.open_work_orders, 0)::int AS open_work_orders,
  now() AS last_refreshed_at
FROM organizations o
LEFT JOIN prop_counts p ON p.organization_id = o.id
LEFT JOIN blog_counts b ON b.organization_id = o.id
LEFT JOIN poi_counts poi ON poi.organization_id = o.id
LEFT JOIN gallery_counts g ON g.organization_id = o.id
LEFT JOIN subscriber_counts s ON s.organization_id = o.id
LEFT JOIN testimonial_stats t ON t.organization_id = o.id
LEFT JOIN reservation_stats r ON r.organization_id = o.id
LEFT JOIN work_order_stats w ON w.organization_id = o.id
WHERE o.is_active = true;

-- 2. Create a unique index for CONCURRENTLY refresh support
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_stats_summary_org_id 
  ON public.organization_stats_summary (organization_id);

-- 3. Create the security wrapper view (SECURITY INVOKER)
-- Only users who belong to the org (via RLS on organization_members) can read
CREATE OR REPLACE VIEW public.organization_stats_secure
WITH (security_invoker = true)
AS
SELECT oss.*
FROM public.organization_stats_summary oss
WHERE EXISTS (
  SELECT 1 FROM public.organization_members om
  WHERE om.organization_id = oss.organization_id
    AND om.user_id = auth.uid()
)
OR public.is_platform_admin(auth.uid());

-- 4. Grant access
GRANT SELECT ON public.organization_stats_summary TO authenticated;
GRANT SELECT ON public.organization_stats_secure TO authenticated;

-- 5. Create the refresh function
CREATE OR REPLACE FUNCTION public.refresh_org_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.organization_stats_summary;
  
  INSERT INTO public.application_logs (level, message, context, tags)
  VALUES (
    'info',
    'organization_stats_summary materialized view refreshed',
    jsonb_build_object('refreshed_at', now()),
    ARRAY['materialized-view', 'refresh', 'dashboard']
  );
END;
$$;

-- 6. Set up pg_cron to refresh every 15 minutes
SELECT cron.schedule(
  'refresh-org-stats-every-15min',
  '*/15 * * * *',
  $$SELECT public.refresh_org_stats()$$
);
