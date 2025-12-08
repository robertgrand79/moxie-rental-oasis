import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ArrowRight, 
  Home,
  Building2
} from 'lucide-react';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Single Property',
      description: 'Perfect for hosts with one vacation rental property',
      icon: Home,
      monthlyPrice: 79.99,
      annualPrice: 63.99,
      properties: '1',
      popular: false,
      features: [
        'Direct booking engine',
        'Beautiful single-property website',
        'Calendar sync (Airbnb, VRBO, Booking.com)',
        'Guest messaging & notifications',
        'Digital guidebook',
        'Stripe payment processing',
        'Custom domain support',
        'Email support',
      ],
    },
    {
      name: 'Multi-Property',
      description: 'For property managers with multiple vacation rentals',
      icon: Building2,
      monthlyPrice: 119.99,
      annualPrice: 95.99,
      properties: 'Unlimited',
      popular: true,
      features: [
        'Everything in Single Property',
        'Unlimited properties',
        'Multi-property portfolio site',
        'Property search & filtering',
        'Team member access',
        'Dynamic pricing integration',
        'Smart home integration',
        'Priority support',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, all plans include a 14-day free trial. No credit card required to start.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, including Visa, Mastercard, and American Express via Stripe.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access continues until the end of your billing period.',
    },
    {
      question: 'What happens when I outgrow Single Property?',
      answer: 'Simply upgrade to Multi-Property when you add more rentals. We\'ll prorate your billing automatically.',
    },
    {
      question: 'Do you handle payment processing?',
      answer: 'You connect your own Stripe account to receive payments directly. We never hold your funds.',
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
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
                  <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : 'bg-muted'
                  }`}>
                    <plan.icon className={`w-7 h-7 ${plan.popular ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-center mb-8">
                    <div className="text-5xl font-bold">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </div>
                    <div className="text-sm text-muted-foreground">per month</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {plan.properties === '1' ? '1 property' : `${plan.properties} properties`}
                    </div>
                    {isAnnual && (
                      <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        Billed annually (${(plan.annualPrice * 12).toFixed(0)}/year)
                      </div>
                    )}
                  </div>
                  
                  <Link to="/auth?tab=signup">
                    <Button 
                      className={`w-full mb-8 h-12 text-base ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
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
          
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
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
