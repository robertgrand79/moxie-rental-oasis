
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MapPin, Plane } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TravelNewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email, name }
      });

      if (error) {
        throw error;
      }

      setIsSubscribed(true);
      toast({
        title: "Welcome to Moxie Travel!",
        description: "You'll receive our latest travel insights and Eugene adventures.",
      });
      
      setEmail('');
      setName('');
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
      <Card className="bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-icon-green">
            <CheckCircle className="h-8 w-8 mr-3" />
            <div className="text-center">
              <h3 className="font-semibold text-foreground">Welcome aboard!</h3>
              <p className="text-sm text-muted-foreground">Get ready for amazing travel content and Eugene adventures.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          Moxie Travel Newsletter
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Get insider travel tips, Eugene local secrets, and stories from Robert & Shelly's adventures delivered to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm bg-background border-border focus:border-ring"
          />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-sm bg-background border-border focus:border-ring"
          />
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "Subscribing..." : "Join Our Travel Community"}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          <span>Discover Eugene & Beyond</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelNewsletterSignup;
