import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Pencil
} from 'lucide-react';

// Interface matching site_templates table
export interface SiteTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price_cents: number;
  annual_price_cents: number | null;
  features: string[] | null;
  max_properties: number | null;
  stripe_price_id: string | null;
  stripe_annual_price_id: string | null;
  is_popular?: boolean | null;
}

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

interface AccountDetailsStepProps {
  selectedTemplate: SiteTemplate;
  onBack: () => void;
  onSubmit: (data: { signupData: SignupData }) => void;
  isLoading: boolean;
}

// Format price from cents to dollars (floor to avoid rounding up)
const formatPrice = (cents: number): string => {
  return `$${Math.floor(cents / 100)}`;
};

export const AccountDetailsStep: React.FC<AccountDetailsStepProps> = ({
  selectedTemplate,
  onBack,
  onSubmit,
  isLoading,
}) => {
  // Personal info only - org details collected post-verification
  const [signupData, setSignupData] = useState<SignupData>({ 
    email: '', 
    password: '', 
    fullName: '', 
    phone: '' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ signupData });
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            2
          </span>
          <span>Step 2 of 2</span>
        </div>
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <p className="text-muted-foreground mt-2">
          You'll set up your business details after verifying your email
        </p>
      </div>

      {/* Selected Plan Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <span className="font-medium">{selectedTemplate.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {formatPrice(selectedTemplate.monthly_price_cents)}/mo
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack}>
              <Pencil className="h-4 w-4 mr-1" />
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info Section */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input
                id="signup-name"
                type="text"
                value={signupData.fullName}
                onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                required
                disabled={isLoading}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-phone">
                Phone <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="signup-phone"
                type="tel"
                value={signupData.phone}
                onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={isLoading}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              value={signupData.email}
              onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={isLoading}
              placeholder="you@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              value={signupData.password}
              onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
              required
              disabled={isLoading}
              minLength={6}
              placeholder="••••••••"
            />
            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12 text-base" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account & Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onBack}
            disabled={isLoading}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plan Selection
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          By signing up, you agree to our{' '}
          <a href="/terms" className="underline">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
        
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
};
