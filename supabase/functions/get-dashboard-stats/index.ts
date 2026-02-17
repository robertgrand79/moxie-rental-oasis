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
      // Check if platform admin
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

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Single consolidated query using CTE pattern via parallel promises on the server
    // This uses 1 connection from the pool instead of 20 from the browser
    const [
      propertiesResult,
      blogTotalResult,
      blogPublishedResult,
      poiTotalResult,
      poiFeaturedResult,
      galleryTotalResult,
      galleryFeaturedResult,
      subscribersTotalResult,
      subscribersMonthResult,
      recentPostsResult,
      checkInsResult,
      checkOutsResult,
      workOrdersResult,
      bookingsMonthResult,
      revenueResult,
      reviewsResult,
    ] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('organization_id', organization_id),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id).eq('status', 'published'),
      supabase.from('places').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id),
      supabase.from('places').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id).eq('is_featured', true),
      supabase.from('lifestyle_gallery').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id),
      supabase.from('lifestyle_gallery').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id).eq('is_featured', true),
      supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('email_opt_in', true),
      supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('subscribed_at', startOfMonth),
      supabase.from('blog_posts').select('id, title, status, created_at').eq('organization_id', organization_id).order('created_at', { ascending: false }).limit(5),
      // Check-ins today (via property_reservations scoped by org properties)
      supabase.from('property_reservations').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id).eq('check_in_date', todayStr).eq('booking_status', 'confirmed'),
      supabase.from('property_reservations').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id).eq('check_out_date', todayStr).eq('booking_status', 'confirmed'),
      supabase.from('work_orders').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id).in('status', ['pending', 'in_progress']),
      supabase.from('property_reservations').select('*', { count: 'exact', head: true }).eq('organization_id', organization_id).gte('created_at', startOfMonth),
      supabase.from('property_reservations').select('total_amount').eq('organization_id', organization_id).gte('created_at', startOfMonth).eq('booking_status', 'confirmed'),
      supabase.from('testimonials').select('rating, organization_id').eq('organization_id', organization_id).eq('is_active', true),
    ]);

    // Calculate revenue
    const revenueThisMonth = (revenueResult.data as { total_amount: number }[] | null)?.reduce(
      (sum, r) => sum + (r.total_amount || 0), 0
    ) || 0;

    // Calculate average rating
    const reviews = reviewsResult.data || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : null;

    const result = {
      // Content stats (useDashboardStats)
      properties: { total: propertiesResult.count || 0 },
      blogPosts: { total: blogTotalResult.count || 0, published: blogPublishedResult.count || 0 },
      pointsOfInterest: { total: poiTotalResult.count || 0, featured: poiFeaturedResult.count || 0 },
      galleryItems: { total: galleryTotalResult.count || 0, featured: galleryFeaturedResult.count || 0 },
      testimonials: { total: (reviewsResult.data || []).length, featured: 0 },
      subscriberCount: subscribersTotalResult.count || 0,
      recentBlogPosts: recentPostsResult.data || [],
      // Analytics stats (useSimplifiedAnalytics)
      checkInsToday: checkInsResult.count || 0,
      checkOutsToday: checkOutsResult.count || 0,
      openWorkOrders: workOrdersResult.count || 0,
      bookingsThisMonth: bookingsMonthResult.count || 0,
      revenueThisMonth,
      subscribersThisMonth: subscribersMonthResult.count || 0,
      totalSubscribers: subscribersTotalResult.count || 0,
      averageRating,
      totalReviews,
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
