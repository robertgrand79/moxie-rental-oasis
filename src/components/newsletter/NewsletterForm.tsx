
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Plane, Shield } from 'lucide-react';
import { NewsletterFormProps, BasicNewsletterFormData } from './types';

const NewsletterForm: React.FC<NewsletterFormProps> = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: BasicNewsletterFormData = { email, name };
    await onSubmit(formData);
    setEmail('');
    setName('');
  };

  return (
    <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 mb-2 group-hover:text-primary transition-colors">
          <Plane className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          Moxie Travel Newsletter
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Get travel tips, Eugene local secrets, and stories from Robert & Shelly's adventures delivered to your inbox.
        </CardDescription>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterForm;
