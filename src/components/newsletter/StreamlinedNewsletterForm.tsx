import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Plane } from 'lucide-react';
import { EnhancedNewsletterFormProps, NewsletterFormData } from './types';

const StreamlinedNewsletterForm: React.FC<EnhancedNewsletterFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    name: '',
    phone: '',
    emailOptIn: true,
    smsOptIn: false,
    communicationPreferences: {
      frequency: 'weekly',
      preferredTime: 'morning'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      email: '',
      name: '',
      phone: '',
      emailOptIn: true,
      smsOptIn: false,
      communicationPreferences: {
        frequency: 'weekly',
        preferredTime: 'morning'
      }
    });
  };

  return (
    <Card className="bg-card border-border shadow-lg max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2 mb-2">
          <Plane className="h-5 w-5 text-primary" />
          Stay Connected with Moxie Travel
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Get travel tips, local secrets, and updates from Robert & Shelly.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-9"
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-9"
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Communication Preferences */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">How would you like to hear from us?</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailOptIn"
                  checked={formData.emailOptIn}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailOptIn: checked as boolean })}
                />
                <Label htmlFor="emailOptIn" className="text-sm flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email newsletters
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsOptIn"
                  checked={formData.smsOptIn}
                  onCheckedChange={(checked) => setFormData({ ...formData, smsOptIn: checked as boolean })}
                />
                <Label htmlFor="smsOptIn" className="text-sm flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  SMS updates (special offers & urgent travel alerts)
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full mt-6 h-11 font-medium"
            disabled={isLoading || (!formData.emailOptIn && !formData.smsOptIn)}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Joining...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Join Our Travel Community
              </div>
            )}
          </Button>

          {/* Privacy Notice */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            Privacy protected • Unsubscribe anytime • No spam, ever
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default StreamlinedNewsletterForm;