import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
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

  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-fraunces">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            No hidden fees. No per-booking charges. Just one flat rate.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  isYearly ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-1 text-green-600">(Save 17%)</span>
            </span>
          </div>
        </div>

        {/* Pricing cards */}
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

              <Link to={plan.name === 'Portfolio' ? '/contact' : '/auth?tab=signup'}>
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
      </div>
    </section>
  );
};

export default PricingSection;
