import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price_cents: number;
  annual_price_cents: number | null;
  features: string[] | null;
  max_properties: number | null;
  stripe_price_id: string | null;
  stripe_annual_price_id: string | null;
  is_popular?: boolean | null;
}

// Fallback static plans if database fetch fails
const fallbackPlans = [
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for single property hosts',
    monthlyPrice: 79,
    yearlyPrice: 66,
    properties: '1 property',
    features: [
      'Multi-channel calendar sync',
      'Unified guest inbox',
      'Basic website builder',
      'Moxie AI (100 responses/mo)',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'For growing rental businesses',
    monthlyPrice: 179,
    yearlyPrice: 149,
    properties: 'Up to 5 properties',
    features: [
      'Everything in Starter',
      'Advanced website with SEO',
      'Local content hub',
      'Moxie AI (500 responses/mo)',
      'Dynamic pricing integration',
      'Team member access',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Portfolio',
    slug: 'portfolio',
    description: 'For professional managers',
    monthlyPrice: 299,
    yearlyPrice: 249,
    properties: 'Unlimited properties',
    features: [
      'Everything in Professional',
      'Moxie AI (unlimited)',
      'White-label branding',
      'API access',
      'Owner reporting portal',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const PricingSection: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  // Fetch templates from database
  const { data: templates, isLoading } = useQuery({
    queryKey: ['site-templates-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_templates')
        .select('*')
        .order('monthly_price_cents', { ascending: true });
      
      if (error) throw error;
      return data as unknown as SiteTemplate[];
    },
  });

  // Transform database templates to display format
  const plans = templates?.length ? templates.map((template) => ({
    name: template.name,
    slug: template.slug,
    description: template.description || '',
    monthlyPrice: template.monthly_price_cents / 100,
    yearlyPrice: template.annual_price_cents 
      ? Math.floor(template.annual_price_cents / 100 / 12) // Show monthly equivalent
      : Math.floor(template.monthly_price_cents / 100 * 0.83), // 17% discount default
    properties: template.max_properties 
      ? template.max_properties === 1 
        ? '1 property' 
        : template.max_properties >= 999 
          ? 'Unlimited properties'
          : `Up to ${template.max_properties} properties`
      : '',
    features: template.features && template.features.length > 0 
      ? template.features 
      : (fallbackPlans.find(p => p.slug === template.slug)?.features || fallbackPlans.find(p => p.name === template.name)?.features || []),
    cta: 'Start Free Trial',
    popular: template.is_popular || false,
    hasStripePrice: !!template.stripe_price_id,
    hasAnnualPrice: !!template.stripe_annual_price_id,
  })) : fallbackPlans;

  const getCtaLink = (plan: typeof plans[0]) => {
    // All tiers go to consolidated signup
    return `/platform/signup`;
  };

  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Pricing
            </span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-fraunces">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            No hidden fees. No per-booking charges. Just one flat rate.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mt-8">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                !isYearly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                isYearly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-green-600 text-xs">(Save 17%)</span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Pricing cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold font-fraunces ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className={`text-5xl font-bold font-fraunces ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                    /month
                  </span>
                  {isYearly && (
                    <span className={`block text-xs mt-1 ${plan.popular ? 'text-blue-200' : 'text-gray-400'}`}>
                      billed annually
                    </span>
                  )}
                  <p className={`text-sm mt-2 font-medium ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.properties}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-blue-500' : 'bg-blue-100'
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-white' : 'text-blue-600'}`} />
                      </div>
                      <span className={`text-sm ${plan.popular ? 'text-blue-50' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to={getCtaLink(plan)}>
                  <Button
                    className={`w-full py-6 text-lg font-semibold rounded-xl ${
                      plan.popular
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
