import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user's JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { organization_id } = await req.json();
    if (!organization_id) {
      return new Response(JSON.stringify({ error: 'organization_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user belongs to this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', organization_id)
      .maybeSingle();

    if (!membership) {
      const { data: platformAdmin } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!platformAdmin) {
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Read from the materialized view — single row, single query
    const { data: stats, error: statsError } = await supabase
      .from('organization_stats_summary')
      .select('*')
      .eq('organization_id', organization_id)
      .maybeSingle();

    // Fetch recent blog posts (not in the MV since it's row-level data)
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('id, title, status, created_at')
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false })
      .limit(5);

    const s = stats || {};

    const result = {
      properties: { total: s.total_properties ?? 0 },
      blogPosts: { total: s.total_blog_posts ?? 0, published: s.published_blog_posts ?? 0 },
      pointsOfInterest: { total: s.total_pois ?? 0, featured: s.featured_pois ?? 0 },
      galleryItems: { total: s.total_gallery_items ?? 0, featured: s.featured_gallery_items ?? 0 },
      testimonials: { total: s.total_testimonials ?? 0, featured: s.featured_testimonials ?? 0 },
      subscriberCount: s.total_subscribers ?? 0,
      recentBlogPosts: recentPosts || [],
      checkInsToday: s.check_ins_today ?? 0,
      checkOutsToday: s.check_outs_today ?? 0,
      openWorkOrders: s.open_work_orders ?? 0,
      bookingsThisMonth: s.bookings_this_month ?? 0,
      revenueThisMonth: s.revenue_this_month ?? 0,
      subscribersThisMonth: s.subscribers_this_month ?? 0,
      totalSubscribers: s.total_subscribers ?? 0,
      averageRating: s.average_rating ?? null,
      totalReviews: s.total_reviews ?? 0,
      lastRefreshedAt: s.last_refreshed_at ?? null,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in get-dashboard-stats:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
