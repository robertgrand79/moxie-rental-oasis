import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Calendar,
  Clock,
  User
} from 'lucide-react';

const PlatformBlog: React.FC = () => {
  // Placeholder blog posts for the platform
  const blogPosts = [
    {
      id: '1',
      title: '10 Strategies to Increase Your Direct Booking Rate',
      excerpt: 'Learn proven tactics to reduce OTA dependency and boost your direct booking revenue by up to 50%.',
      category: 'Direct Bookings',
      author: 'StayMoxie Team',
      date: '2024-12-01',
      readTime: '8 min',
      image: null,
    },
    {
      id: '2',
      title: 'The Ultimate Guide to Local SEO for Vacation Rentals',
      excerpt: 'How to optimize your vacation rental website to rank higher in local search results and attract more guests.',
      category: 'Marketing',
      author: 'StayMoxie Team',
      date: '2024-11-28',
      readTime: '12 min',
      image: null,
    },
    {
      id: '3',
      title: 'Why Your Vacation Rental Needs a Content Hub',
      excerpt: 'Discover how creating local content can establish your authority and drive organic bookings year-round.',
      category: 'Content Strategy',
      author: 'StayMoxie Team',
      date: '2024-11-25',
      readTime: '6 min',
      image: null,
    },
    {
      id: '4',
      title: 'Smart Home Technology for Vacation Rentals: A Complete Guide',
      excerpt: 'From smart locks to noise monitoring, learn how to automate your property operations with smart home tech.',
      category: 'Technology',
      author: 'StayMoxie Team',
      date: '2024-11-20',
      readTime: '10 min',
      image: null,
    },
    {
      id: '5',
      title: 'How to Use AI to Automate Guest Communication',
      excerpt: 'Save hours every week with AI-powered messaging while maintaining a personal touch with your guests.',
      category: 'AI & Automation',
      author: 'StayMoxie Team',
      date: '2024-11-15',
      readTime: '7 min',
      image: null,
    },
    {
      id: '6',
      title: 'Dynamic Pricing Strategies for Maximum Revenue',
      excerpt: 'Learn how to implement dynamic pricing that maximizes your revenue without turning away potential guests.',
      category: 'Revenue',
      author: 'StayMoxie Team',
      date: '2024-11-10',
      readTime: '9 min',
      image: null,
    },
  ];

  const categories = [
    'All',
    'Direct Bookings',
    'Marketing',
    'Content Strategy',
    'Technology',
    'AI & Automation',
    'Revenue',
    'Guest Experience',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              StayMoxie Blog
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, strategies, and tips to help vacation rental hosts succeed with direct bookings.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All' ? 'default' : 'outline'}
                size="sm"
                className={category === 'All' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                {/* Placeholder Image */}
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-t-lg" />
                
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 lg:py-24 bg-muted/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get the latest vacation rental insights, tips, and strategies delivered to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
              Subscribe
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Grow Your Direct Bookings?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Start your free trial and see how StayMoxie can transform your vacation rental business.
          </p>
          
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-background text-primary hover:bg-background/90 text-lg px-8">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PlatformBlog;
