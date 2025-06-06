
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NewsletterSignup = () => {
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
        title: "Subscribed Successfully!",
        description: "You'll receive our latest travel insights and tips.",
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
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle className="h-8 w-8 mr-3" />
            <div>
              <h3 className="font-semibold">Welcome to our newsletter!</h3>
              <p className="text-sm text-green-700">You'll hear from us soon with amazing travel content.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center text-xl">
          <Mail className="h-5 w-5 mr-2" />
          Stay Updated
        </CardTitle>
        <CardDescription>
          Get the latest travel tips and destination guides delivered to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white"
          />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white"
          />
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
