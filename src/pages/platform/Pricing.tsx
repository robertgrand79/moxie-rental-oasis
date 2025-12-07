import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  ArrowRight, 
  Zap,
  Building2,
  Rocket,
  Crown
} from 'lucide-react';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for hosts just getting started with direct bookings',
      icon: Zap,
      monthlyPrice: 49,
      annualPrice: 39,
      properties: '1-3',
      popular: false,
      features: [
        { name: 'Direct booking engine', included: true },
        { name: 'Basic website template', included: true },
        { name: 'Calendar sync (2 channels)', included: true },
        { name: 'Guest messaging', included: true },
        { name: 'Email support', included: true },
        { name: 'Local content hub', included: false },
        { name: 'AI messaging', included: false },
        { name: 'Smart home integration', included: false },
        { name: 'Custom domain', included: false },
        { name: 'Priority support', included: false },
      ],
    },
    {
      name: 'Professional',
      description: 'For serious hosts ready to grow their direct booking business',
      icon: Rocket,
      monthlyPrice: 99,
      annualPrice: 79,
      properties: '1-10',
      popular: true,
      features: [
        { name: 'Direct booking engine', included: true },
        { name: 'Premium website templates', included: true },
        { name: 'Unlimited calendar sync', included: true },
        { name: 'Guest messaging', included: true },
        { name: 'Local content hub', included: true },
        { name: 'AI messaging (500/mo)', included: true },
        { name: 'Smart home integration', included: true },
        { name: 'Custom domain', included: true },
        { name: 'Digital guidebooks', included: true },
        { name: 'Priority support', included: false },
      ],
    },
    {
      name: 'Business',
      description: 'For property managers scaling their portfolio',
      icon: Building2,
      monthlyPrice: 199,
      annualPrice: 159,
      properties: '1-25',
      popular: false,
      features: [
        { name: 'Everything in Professional', included: true },
        { name: 'Unlimited AI messaging', included: true },
        { name: 'Team access (5 users)', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'White-label branding', included: true },
        { name: 'API access', included: true },
        { name: 'Priority support', included: true },
        { name: 'Dedicated account manager', included: false },
        { name: 'Custom integrations', included: false },
        { name: 'SLA guarantee', included: false },
      ],
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large portfolios',
      icon: Crown,
      monthlyPrice: null,
      annualPrice: null,
      properties: 'Unlimited',
      popular: false,
      features: [
        { name: 'Everything in Business', included: true },
        { name: 'Unlimited properties', included: true },
        { name: 'Unlimited team members', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'SLA guarantee', included: true },
        { name: 'On-boarding assistance', included: true },
        { name: 'Custom training', included: true },
        { name: 'Volume discounts', included: true },
        { name: '24/7 phone support', included: true },
      ],
    },
  ];

  const faqs = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
    },
    {
      question: 'What happens if I exceed my property limit?',
      answer: 'We\'ll notify you when you\'re approaching your limit. You can easily upgrade to the next tier to add more properties.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, all plans include a 14-day free trial. No credit card required to start.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, including Visa, Mastercard, and American Express. Enterprise plans can also pay via invoice.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access continues until the end of your billing period.',
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes! Contact us for special pricing for non-profit organizations and community housing initiatives.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-foreground">Simple, Transparent</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Choose the plan that fits your portfolio. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                Save 20%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 lg:pb-32 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-emerald-500 border-2 shadow-xl' : 'border-border shadow-lg'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : 'bg-muted'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="h-12">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-center mb-6">
                    {plan.monthlyPrice !== null ? (
                      <>
                        <div className="text-4xl font-bold">
                          ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </div>
                        <div className="text-sm text-muted-foreground">per month</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Up to {plan.properties} properties
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">Custom Pricing</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {plan.properties} properties
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Link to={plan.monthlyPrice !== null ? '/auth?tab=signup' : '/contact'}>
                    <Button 
                      className={`w-full mb-6 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.monthlyPrice !== null ? 'Start Free Trial' : 'Contact Sales'}
                    </Button>
                  </Link>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Your Free Trial Today
          </h2>
          <p className="text-xl text-white/80 mb-10">
            No credit card required. Full access to all features for 14 days.
          </p>
          
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-white/90 text-lg px-8">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
