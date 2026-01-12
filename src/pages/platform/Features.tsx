import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  CreditCard, 
  Bot, 
  Lock, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  FileText,
  Image,
  Users,
  BarChart3,
  Settings,
  Globe,
  Smartphone,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const Features: React.FC = () => {
  const featureCategories = [
    {
      id: 'content-hub',
      title: 'Local Content Hub',
      subtitle: 'Become the go-to resource in your market',
      icon: MapPin,
      color: 'from-emerald-500 to-green-600',
      features: [
        { title: 'SEO-Optimized Blog', description: 'Built-in blog with automatic SEO optimization for local search rankings', icon: FileText },
        { title: 'Events Calendar', description: 'Showcase local events and activities to inspire guest bookings', icon: Calendar },
        { title: 'Local Places Guide', description: 'Restaurant recommendations, attractions, and insider tips', icon: Globe },
        { title: 'Photo Galleries', description: 'Beautiful galleries showcasing your properties and local area', icon: Image },
      ],
    },
    {
      id: 'direct-booking',
      title: 'Direct Booking Engine',
      subtitle: 'Keep more revenue with commission-free bookings',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      features: [
        { title: 'Stripe Integration', description: 'Secure payment processing with automatic payouts', icon: CreditCard },
        { title: 'Dynamic Pricing', description: 'PriceLabs integration for automated market-based pricing', icon: TrendingUp },
        { title: 'Instant Booking', description: 'Real-time availability with instant confirmation', icon: Zap },
        { title: 'Multi-Property Support', description: 'Manage unlimited properties from one dashboard', icon: Settings },
      ],
    },
    {
      id: 'ai-operations',
      title: 'AI-Powered Operations',
      subtitle: 'Automate the busywork, focus on hospitality',
      icon: Bot,
      color: 'from-purple-500 to-violet-600',
      features: [
        { title: 'Smart Messaging', description: 'AI-generated responses for common guest inquiries', icon: MessageSquare },
        { title: 'Automated Workflows', description: 'Trigger messages, tasks, and notifications automatically', icon: Settings },
        { title: 'Review Management', description: 'AI-assisted responses to guest reviews', icon: Users },
        { title: 'Insights Dashboard', description: 'AI-powered analytics and recommendations', icon: BarChart3 },
      ],
    },
    {
      id: 'smart-home',
      title: 'Smart Home Integration',
      subtitle: 'Keyless entry and device automation',
      icon: Lock,
      color: 'from-orange-500 to-amber-600',
      features: [
        { title: 'SEAM Integration', description: 'Connect 100+ smart lock brands for keyless access', icon: Lock },
        { title: 'Auto Access Codes', description: 'Generate and share unique codes for each guest', icon: Shield },
        { title: 'Device Monitoring', description: 'Monitor thermostats, noise sensors, and more', icon: Smartphone },
        { title: 'Automation Rules', description: 'Set rules for check-in, checkout, and between stays', icon: Settings },
      ],
    },
    {
      id: 'calendar-sync',
      title: 'Multi-Channel Sync',
      subtitle: 'One calendar, every platform',
      icon: Calendar,
      color: 'from-teal-500 to-cyan-600',
      features: [
        { title: 'iCal Import/Export', description: 'Sync with Airbnb, VRBO, Booking.com and more', icon: Calendar },
        { title: 'Real-Time Updates', description: 'Automatic sync every 6 hours or on-demand', icon: Zap },
        { title: 'Conflict Prevention', description: 'Block dates instantly to prevent double bookings', icon: Shield },
        { title: 'Timeline View', description: 'Visual calendar showing all bookings at a glance', icon: BarChart3 },
      ],
    },
    {
      id: 'guest-experience',
      title: 'Guest Experience Suite',
      subtitle: 'Create 5-star stays every time',
      icon: MessageSquare,
      color: 'from-rose-500 to-pink-600',
      features: [
        { title: 'Digital Guidebooks', description: 'Custom property guides with house rules and local tips', icon: FileText },
        { title: 'Automated Messages', description: 'Pre-arrival, check-in, and post-stay communications', icon: MessageSquare },
        { title: 'Guest Portal', description: 'Self-service portal for guest needs and requests', icon: Users },
        { title: 'Review Collection', description: 'Automated review requests and management', icon: TrendingUp },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 dark:from-blue-950/20 dark:via-blue-950/20 dark:to-indigo-950/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Powerful Features
            </span>
            <br />
            <span className="text-foreground">for Vacation Rental Success</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Everything you need to build your brand, drive direct bookings, and deliver exceptional guest experiences.
          </p>
          <Link to="/platform/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, index) => (
        <section 
          key={category.id} 
          id={category.id}
          className={`py-20 lg:py-32 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Category Header */}
              <div className="lg:w-1/3 lg:sticky lg:top-24">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-6`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3">{category.title}</h2>
                <p className="text-lg text-muted-foreground mb-6">{category.subtitle}</p>
              </div>

              {/* Feature Cards */}
              <div className="lg:w-2/3 grid sm:grid-cols-2 gap-6">
                {category.features.map((feature, featureIndex) => (
                  <Card key={featureIndex} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                        <feature.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Integrations Section */}
      <section id="integrations" className="py-20 lg:py-32 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Integrates With Your Tools</h2>
          <p className="text-lg text-muted-foreground mb-12">
            StayMoxie works seamlessly with the platforms you already use.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              'Stripe', 'PriceLabs', 'SEAM', 'Airbnb', 'VRBO', 'Booking.com',
              'Resend', 'QUO', 'Turno', 'Google Calendar', 'Twilio', 'Zapier'
            ].map((integration) => (
              <div key={integration} className="p-4 bg-background rounded-xl shadow-sm border border-border">
                <div className="text-sm font-medium">{integration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join hundreds of hosts who've switched to StayMoxie for their vacation rental management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/platform/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 text-lg px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
