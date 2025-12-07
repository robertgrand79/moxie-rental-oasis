import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  Home, 
  CreditCard, 
  Bot, 
  Lock, 
  Calendar, 
  Star,
  TrendingUp,
  MapPin,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const PlatformHome: React.FC = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Local Content Hub',
      description: 'SEO-optimized blog, events calendar, and local guides that drive organic traffic and establish your market authority.',
      color: 'text-emerald-500',
    },
    {
      icon: CreditCard,
      title: 'Direct Booking Engine',
      description: 'Skip OTA fees with integrated Stripe payments, dynamic pricing, and a seamless guest booking experience.',
      color: 'text-blue-500',
    },
    {
      icon: Bot,
      title: 'AI-Powered Operations',
      description: 'Smart automated messaging, pricing recommendations, and guest communication that saves hours every week.',
      color: 'text-purple-500',
    },
    {
      icon: Lock,
      title: 'Smart Home Ready',
      description: 'SEAM integration for keyless access, automated check-in codes, and device management across all your properties.',
      color: 'text-orange-500',
    },
    {
      icon: Calendar,
      title: 'Multi-Channel Sync',
      description: 'One calendar across Airbnb, VRBO, Booking.com with PriceLabs integration for dynamic pricing.',
      color: 'text-teal-500',
    },
    {
      icon: MessageSquare,
      title: 'Guest Experience Suite',
      description: 'Digital guidebooks, automated messaging, review management, and a guest portal that wows.',
      color: 'text-rose-500',
    },
  ];

  const stats = [
    { value: '35%', label: 'Average increase in direct bookings' },
    { value: '15hrs', label: 'Saved per week on operations' },
    { value: '$2,400', label: 'Average saved in OTA fees monthly' },
    { value: '4.9★', label: 'Average guest satisfaction' },
  ];

  const testimonials = [
    {
      quote: "StayMoxie transformed our vacation rental business. We went from 10% direct bookings to over 50% in just 6 months.",
      author: "Sarah M.",
      role: "Property Manager, 12 units",
    },
    {
      quote: "The local content hub is a game-changer. Our blog posts now drive more bookings than our OTA listings combined.",
      author: "Mike T.",
      role: "Vacation Rental Owner",
    },
    {
      quote: "Finally, software that understands vacation rentals. The AI messaging alone saves me 10+ hours every week.",
      author: "Jennifer L.",
      role: "Superhost, 8 properties",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              All-in-One Vacation Rental Software
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Dominate Your Local Market
              </span>
              <br />
              <span className="text-foreground">with Direct Bookings</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Stop paying OTA fees. Build your brand with a local content hub, AI-powered operations, and a direct booking engine that converts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?tab=signup">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg px-8 h-14">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for vacation rental hosts who want to take control of their business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/features">
              <Button variant="outline" size="lg">
                Explore All Features
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-muted-foreground">
              Launch your direct booking website and start capturing more revenue.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Account',
                description: 'Sign up for free and set up your organization with your brand details.',
              },
              {
                step: '2',
                title: 'Add Your Properties',
                description: 'Import from Airbnb or add manually. Connect calendars, set pricing, upload photos.',
              },
              {
                step: '3',
                title: 'Launch & Grow',
                description: 'Publish your site, start creating local content, and watch direct bookings roll in.',
              },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Vacation Rental Hosts
            </h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of hosts who've transformed their business with StayMoxie.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
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
            Ready to Take Control of Your Rentals?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Start your 14-day free trial today. No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-white/90 text-lg px-8 h-14">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 h-14">
                View Pricing
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformHome;
