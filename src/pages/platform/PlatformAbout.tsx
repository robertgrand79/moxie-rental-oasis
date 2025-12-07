import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Target, 
  Users, 
  Lightbulb,
  MapPin,
  ArrowRight,
  Zap,
  Globe,
  TrendingUp
} from 'lucide-react';

const PlatformAbout: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Host-First Approach',
      description: 'We build every feature with vacation rental hosts in mind. Your success is our success.',
    },
    {
      icon: MapPin,
      title: 'Local Market Focus',
      description: 'We believe in the power of local. Your market knowledge is your competitive advantage.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We leverage AI and automation to eliminate busywork so you can focus on hospitality.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We\'re building a community of hosts who share knowledge and support each other.',
    },
  ];

  const team = [
    {
      name: 'The StayMoxie Team',
      role: 'Vacation Rental Enthusiasts',
      description: 'A passionate team of developers, designers, and vacation rental hosts building the future of direct bookings.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-foreground">Our Mission:</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Empower Vacation Rental Hosts
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              We're on a mission to help vacation rental hosts take back control of their business through direct bookings and local market dominance.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why We Built StayMoxie</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We've been in the vacation rental industry for years. We've seen hosts pay thousands in OTA commissions, struggle with disconnected tools, and lose control of their guest relationships.
                </p>
                <p>
                  We knew there had to be a better way. A way for hosts to build their own brand, connect directly with guests, and keep more of their hard-earned revenue.
                </p>
                <p>
                  That's why we built StayMoxie – an all-in-one platform that combines direct booking technology with local content marketing and AI-powered operations. 
                </p>
                <p>
                  We believe that vacation rental hosts shouldn't have to choose between reach and profitability. With the right tools, you can build a sustainable, profitable business that's truly your own.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">StayMoxie</h3>
                  <p className="text-muted-foreground">All-in-One Vacation Rental Software</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What We Believe</h2>
          
          <div className="space-y-8">
            {[
              {
                icon: Globe,
                title: 'Local Knowledge is Power',
                description: 'You know your market better than any algorithm. We give you tools to turn that knowledge into bookings through local content and SEO.',
              },
              {
                icon: TrendingUp,
                title: 'Direct Bookings are the Future',
                description: 'Building direct guest relationships leads to better reviews, repeat bookings, and sustainable business growth.',
              },
              {
                icon: Zap,
                title: 'Technology Should Save Time',
                description: 'AI and automation should handle the busywork, freeing you to focus on creating exceptional guest experiences.',
              },
            ].map((belief, index) => (
              <div key={index} className="flex gap-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <belief.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{belief.title}</h3>
                  <p className="text-muted-foreground">{belief.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join the Direct Booking Revolution
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Start your free trial today and see why hosts love StayMoxie.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-white/90 text-lg px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformAbout;
