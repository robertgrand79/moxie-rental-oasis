
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Plane, Shield } from 'lucide-react';
import { EnhancedNewsletterFormProps, NewsletterFormData } from './types';

const EnhancedNewsletterForm: React.FC<EnhancedNewsletterFormProps> = ({ onSubmit, isLoading }) => {
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
    <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 mb-2 group-hover:text-primary transition-colors">
          <Plane className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          Stay Connected with Moxie Travel
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Choose how you'd like to receive travel tips, local secrets, and updates from Robert & Shelly.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="text-sm"
            />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="text-sm"
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="text-sm"
            />
          </div>

          {/* Communication Preferences */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">How would you like to hear from us?</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailOptIn"
                  checked={formData.emailOptIn}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailOptIn: checked as boolean })}
                />
                <Label htmlFor="emailOptIn" className="text-sm flex items-center gap-2">
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
                <Label htmlFor="smsOptIn" className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS updates (special offers & urgent travel alerts)
                </Label>
              </div>
            </div>
          </div>

          {/* Frequency Preference */}
          <div className="space-y-2">
            <Label htmlFor="frequency">How often would you like to hear from us?</Label>
            <Select
              value={formData.communicationPreferences.frequency}
              onValueChange={(value) => setFormData({
                ...formData,
                communicationPreferences: {
                  ...formData.communicationPreferences,
                  frequency: value as 'daily' | 'weekly' | 'monthly'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Time */}
          <div className="space-y-2">
            <Label htmlFor="preferredTime">Preferred time to receive updates</Label>
            <Select
              value={formData.communicationPreferences.preferredTime}
              onValueChange={(value) => setFormData({
                ...formData,
                communicationPreferences: {
                  ...formData.communicationPreferences,
                  preferredTime: value as 'morning' | 'afternoon' | 'evening'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200 text-sm py-3 h-auto font-medium"
            disabled={isLoading || (!formData.emailOptIn && !formData.smsOptIn)}
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

          {/* Trust Signals */}
          <div className="flex flex-col space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <Shield className="h-3 w-3 mr-1 text-icon-green" />
              <span>Privacy protected • Unsubscribe anytime • No spam, ever</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsletterForm;
