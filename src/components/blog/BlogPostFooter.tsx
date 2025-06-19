
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Users, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterSignup from '@/components/NewsletterSignup';

const BlogPostFooter = () => {
  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-border">
      {/* Newsletter Signup Section */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Enjoyed this post?
          </h3>
          <p className="text-muted-foreground">
            Get more travel insights, local Eugene tips, and exclusive offers delivered to your inbox.
          </p>
        </div>
        <NewsletterSignup />
      </div>

      {/* Moxie Vacation Rentals Links */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">
            Ready to Experience Eugene?
          </CardTitle>
          <p className="text-muted-foreground">
            Discover our carefully curated vacation rentals and local experiences
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/properties">
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 bg-card hover:bg-accent border-border hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-foreground">Explore Our Properties</div>
                    <div className="text-sm text-muted-foreground">Find your perfect Eugene stay</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-auto" />
                </div>
              </Button>
            </Link>

            <Link to="/experiences">
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 bg-card hover:bg-accent border-border hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-foreground">Local Experiences</div>
                    <div className="text-sm text-muted-foreground">Discover Eugene like a local</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-auto" />
                </div>
              </Button>
            </Link>

            <Link to="/about">
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 bg-card hover:bg-accent border-border hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-foreground">About Our Team</div>
                    <div className="text-sm text-muted-foreground">Meet Robert & Shelly</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-auto" />
                </div>
              </Button>
            </Link>

            <Link to="/contact">
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 bg-card hover:bg-accent border-border hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold text-foreground">Contact Us</div>
                    <div className="text-sm text-muted-foreground">Plan your perfect stay</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-auto" />
                </div>
              </Button>
            </Link>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by hundreds of guests • Locally owned & operated
            </p>
            <Link to="/properties">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                View All Properties
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPostFooter;
