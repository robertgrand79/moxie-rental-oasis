import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  XCircle,
  Package,
  Pencil
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  onSubmit: (data: {
    signupData: SignupData;
    orgName: string;
    slug: string;
    includeDemoData: boolean;
  }) => void;
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
  // Personal info
  const [signupData, setSignupData] = useState<SignupData>({ 
    email: '', 
    password: '', 
    fullName: '', 
    phone: '' 
  });
  
  // Organization info
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [includeDemoData, setIncludeDemoData] = useState(true);

  // Auto-generate slug from org name
  useEffect(() => {
    const generatedSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
    setSlug(generatedSlug);
  }, [orgName]);

  // Check slug availability with debounce
  const checkSlugAvailability = useCallback(async (slugToCheck: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_slug_available', { _slug: slugToCheck });
      if (error) return false;
      return data as boolean;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkSlugAvailability(slug);
      setSlugStatus(available ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, checkSlugAvailability]);

  // Demo data not available for site_templates flow - always start fresh
  const includeDemoDataDefault = false;
  useEffect(() => {
    setIncludeDemoData(includeDemoDataDefault);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      signupData,
      orgName,
      slug,
      includeDemoData,
    });
  };

  // Site templates don't have demo data - remove this section
  const hasDemoDataAvailable = false;

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
        <h1 className="text-2xl font-bold">Your Details</h1>
        <p className="text-muted-foreground mt-2">
          Set up your account and business
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
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">1</span>
            Your Information
          </h2>
          
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

        {/* Business Info Section */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">2</span>
            Your Business
          </h2>
          
          <div className="space-y-2">
            <Label htmlFor="org-name">Business / Organization Name</Label>
            <Input
              id="org-name"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="My Vacation Rentals"
              minLength={2}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Site URL</Label>
            <div className="relative">
              <Input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                disabled={isLoading}
                placeholder="my-rentals"
                minLength={3}
                maxLength={30}
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {slugStatus === 'checking' && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {slugStatus === 'available' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {slugStatus === 'taken' && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your site: <span className="font-mono">{slug || 'your-slug'}.staymoxie.com</span>
            </p>
            {slugStatus === 'taken' && (
              <p className="text-xs text-destructive">This URL is already taken</p>
            )}
          </div>
        </div>

        {/* Demo Data Toggle */}
        {hasDemoDataAvailable && (
          <div className="flex items-center justify-between rounded-lg border p-4 bg-green-500/5 border-green-500/20">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <Label htmlFor="demo-data" className="text-sm font-medium cursor-pointer">
                  Include sample content
                </Label>
                <p className="text-xs text-muted-foreground">
                  Start with demo properties, blog posts, and more
                </p>
              </div>
            </div>
            <Switch
              id="demo-data"
              checked={includeDemoData}
              onCheckedChange={setIncludeDemoData}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12 text-base" 
            disabled={isLoading || slugStatus === 'checking' || slugStatus === 'taken'}
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
