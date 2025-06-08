
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';
import { NewsletterSuccessProps } from './types';

const NewsletterSuccess: React.FC<NewsletterSuccessProps> = ({ userName }) => {
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
              Get ready for travel content and Eugene local secrets from Robert & Shelly.
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
};

export default NewsletterSuccess;
