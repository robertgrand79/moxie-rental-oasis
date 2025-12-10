import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-STRIPE-PRODUCTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Stripe products sync");

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get platform Stripe secret key from platform_settings
    const { data: stripeKeyData, error: keyError } = await supabaseClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'platform_stripe_secret_key')
      .single();

    if (keyError || !stripeKeyData?.value) {
      logStep("No platform Stripe key configured", keyError);
      return new Response(JSON.stringify({ 
        error: 'Platform Stripe key not configured. Please add it in Super Admin Settings.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const stripe = new Stripe(stripeKeyData.value, {
      apiVersion: "2023-10-16",
    });

    // Get all active templates
    const { data: templates, error: templatesError } = await supabaseClient
      .from('site_templates')
      .select('*')
      .eq('is_active', true);

    if (templatesError) {
      throw templatesError;
    }

    logStep("Found templates to sync", { count: templates?.length });

    const results = [];

    for (const template of templates || []) {
      logStep(`Processing template: ${template.name}`);

      let productId = template.stripe_product_id;
      let priceId = template.stripe_price_id;

      // Create or update product
      if (!productId) {
        const product = await stripe.products.create({
          name: `StayMoxie - ${template.name}`,
          description: template.description || `${template.name} subscription plan`,
          metadata: {
            template_id: template.id,
            template_slug: template.slug
          }
        });
        productId = product.id;
        logStep(`Created Stripe product`, { productId });
      } else {
        // Try to update existing product, create new one if it doesn't exist
        try {
          await stripe.products.update(productId, {
            name: `StayMoxie - ${template.name}`,
            description: template.description || `${template.name} subscription plan`,
            metadata: {
              template_id: template.id,
              template_slug: template.slug
            }
          });
          logStep(`Updated Stripe product`, { productId });
        } catch (updateError: any) {
          if (updateError.message?.includes('No such product')) {
            logStep(`Product not found in Stripe, creating new one`, { oldProductId: productId });
            const product = await stripe.products.create({
              name: `StayMoxie - ${template.name}`,
              description: template.description || `${template.name} subscription plan`,
              metadata: {
                template_id: template.id,
                template_slug: template.slug
              }
            });
            productId = product.id;
            priceId = null; // Reset price since we have a new product
            logStep(`Created new Stripe product`, { productId });
          } else {
            throw updateError;
          }
        }
      }

      // Create new price if none exists or if price changed
      if (!priceId) {
        const price = await stripe.prices.create({
          product: productId,
          unit_amount: template.monthly_price_cents,
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          metadata: {
            template_id: template.id,
            template_slug: template.slug
          }
        });
        priceId = price.id;
        logStep(`Created Stripe price`, { priceId, amount: template.monthly_price_cents });
      } else {
        // Check if price amount changed
        const existingPrice = await stripe.prices.retrieve(priceId);
        if (existingPrice.unit_amount !== template.monthly_price_cents) {
          // Archive old price and create new one
          await stripe.prices.update(priceId, { active: false });
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: template.monthly_price_cents,
            currency: 'usd',
            recurring: {
              interval: 'month'
            },
            metadata: {
              template_id: template.id,
              template_slug: template.slug
            }
          });
          priceId = newPrice.id;
          logStep(`Updated Stripe price (archived old, created new)`, { priceId, amount: template.monthly_price_cents });
        }
      }

      // Update template with Stripe IDs
      const { error: updateError } = await supabaseClient
        .from('site_templates')
        .update({
          stripe_product_id: productId,
          stripe_price_id: priceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (updateError) {
        logStep(`Failed to update template`, { templateId: template.id, error: updateError });
        results.push({
          template: template.name,
          success: false,
          error: updateError.message
        });
      } else {
        results.push({
          template: template.name,
          success: true,
          productId,
          priceId
        });
      }
    }

    logStep("Sync completed", { results });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Stripe products synced successfully',
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    logStep("Error syncing Stripe products", { error: error.message });
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
