
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, MapPin, Plane, Users, Star, Mail, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TravelNewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleInterestChange = (interest: string, checked: boolean) => {
    setInterests(prev => 
      checked 
        ? [...prev, interest]
        : prev.filter(i => i !== interest)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { 
          email, 
          name, 
          frequency, 
          interests: interests.length > 0 ? interests : ['general'] 
        }
      });

      if (error) {
        throw error;
      }

      setIsSubscribed(true);
      toast({
        title: "🎉 Welcome to Moxie Travel!",
        description: "You'll receive our handpicked travel insights and Eugene adventures.",
      });
      
      setEmail('');
      setName('');
      setInterests([]);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to border-border shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <CheckCircle className="h-12 w-12 text-icon-green animate-scale-in" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-icon-green rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">🎉 Welcome aboard!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get ready for amazing travel content, Eugene local secrets, and exclusive adventures from Robert & Shelly.
              </p>
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <Mail className="h-3 w-3 mr-1" />
                <span>First newsletter arriving soon!</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const interestOptions = [
    { id: 'travel-tips', label: 'Travel Tips & Guides', icon: MapPin },
    { id: 'eugene-local', label: 'Eugene Local Secrets', icon: Star },
    { id: 'robert-shelly', label: "Robert & Shelly's Adventures", icon: Plane }
  ];

  const recentHighlights = [
    "🏔️ Hidden Eugene hiking trails",
    "✈️ Robert & Shelly's Japan adventure", 
    "🍷 Oregon wine country guide"
  ];

  return (
    <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 mb-2 group-hover:text-primary transition-colors">
              <Plane className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              Moxie Travel Newsletter
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mb-3">
              Join <span className="font-semibold text-icon-blue">2,500+ travelers</span> getting insider tips, Eugene local secrets, and stories from Robert & Shelly's adventures
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-icon-blue/10 to-icon-green/10 text-icon-blue border-icon-blue/20">
            <Users className="h-3 w-3 mr-1" />
            2.5K+
          </Badge>
        </div>

        {/* Recent Highlights */}
        <div className="bg-muted/50 rounded-lg p-3 mb-2">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
            <Star className="h-3 w-3 mr-1 text-icon-amber" />
            Recent highlights:
          </p>
          <div className="space-y-1">
            {recentHighlights.map((highlight, index) => (
              <p key={index} className="text-xs text-muted-foreground">{highlight}</p>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm bg-background border-border focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 pl-4 pr-4 py-3 h-auto"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm bg-background border-border focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 pl-4 pr-4 py-3 h-auto"
            />
          </div>

          {/* Frequency Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              How often would you like to hear from us?
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={frequency === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFrequency('weekly')}
                className="flex-1 text-xs h-8"
              >
                Weekly
              </Button>
              <Button
                type="button"
                variant={frequency === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFrequency('monthly')}
                className="flex-1 text-xs h-8"
              >
                Monthly
              </Button>
            </div>
          </div>

          {/* Interest Selection */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground">
              What interests you most? (optional)
            </label>
            <div className="space-y-2">
              {interestOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={interests.includes(option.id)}
                      onCheckedChange={(checked) => handleInterestChange(option.id, checked as boolean)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor={option.id}
                      className="text-xs text-muted-foreground cursor-pointer flex items-center hover:text-foreground transition-colors"
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {option.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200 text-sm py-3 h-auto font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Subscribing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Join Our Travel Community
              </div>
            )}
          </Button>
        </form>

        {/* Trust Signals */}
        <div className="flex flex-col space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <Shield className="h-3 w-3 mr-1 text-icon-green" />
            <span>Privacy protected • Unsubscribe anytime</span>
          </div>
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span>Discover Eugene & Beyond with Local Experts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelNewsletterSignup;
