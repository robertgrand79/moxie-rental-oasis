import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { Zap, ArrowRight, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price_cents: number;
  annual_price_cents: number | null;
  features: string[] | null;
  max_properties: number | null;
}

const PlatformGetStarted: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planSlug = searchParams.get('plan') || 'starter';
  const billingCycle = searchParams.get('billing') || 'monthly';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    companyName: '' 
  });
  
  const { signIn, signUp, user, loading, roleLoading } = useAuth();
  const { organization, loading: orgLoading, refetch: refetchOrg } = useCurrentOrganization();
  const navigate = useNavigate();

  // Fetch selected template
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['site-template', planSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_templates')
        .select('*')
        .eq('slug', planSlug)
        .single();
      
      if (error) throw error;
      return data as SiteTemplate;
    },
  });

  // After signup + org creation, redirect to checkout
  useEffect(() => {
    const initiateCheckout = async () => {
      if (user && !loading && !roleLoading && !orgLoading && organization?.id) {
        // User is logged in and has an organization - initiate checkout
        setIsCreatingOrg(true);
        try {
          const { data, error } = await supabase.functions.invoke('platform-subscription-checkout', {
            body: {
              organizationId: organization.id,
              templateSlug: planSlug,
              billingCycle: billingCycle,
              successUrl: `${window.location.origin}/admin?subscription=success`,
              cancelUrl: `${window.location.origin}/admin?subscription=cancelled`,
            },
          });

          if (error) throw error;
          
          if (data?.url) {
            window.location.href = data.url;
          } else {
            throw new Error('No checkout URL returned');
          }
        } catch (error: any) {
          console.error('Checkout error:', error);
          toast({
            title: 'Checkout Error',
            description: error.message || 'Failed to initiate checkout. Please try again.',
            variant: 'destructive',
          });
          // Redirect to admin anyway - they can try billing settings there
          navigate('/admin');
        } finally {
          setIsCreatingOrg(false);
        }
      }
    };

    initiateCheckout();
  }, [user, loading, roleLoading, orgLoading, organization, planSlug, billingCycle, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, sign up the user
      const { error: signUpError } = await signUp(
        signupData.email, 
        signupData.password, 
        signupData.fullName
      );
      
      if (signUpError) {
        let errorMessage = signUpError.message;
        if (signUpError.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        }
        
        toast({
          title: 'Signup Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Signup was successful - show email confirmation message
      // The useEffect will handle checkout once user is authenticated
      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account, then log in to continue.',
        duration: 10000,
      });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createOrganizationAndCheckout = async (userId: string) => {
    setIsCreatingOrg(true);
    try {
      // Create organization
      const orgName = signupData.companyName || `${signupData.fullName}'s Organization`;
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug: slug,
          template_id: template?.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: newOrg.id,
          user_id: userId,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Initiate checkout
      const { data, error } = await supabase.functions.invoke('platform-subscription-checkout', {
        body: {
          organizationId: newOrg.id,
          templateSlug: planSlug,
          billingCycle: billingCycle,
          successUrl: `${window.location.origin}/admin?subscription=success`,
          cancelUrl: `${window.location.origin}/admin?subscription=cancelled`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        // Fallback to admin if no checkout URL
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Organization creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create organization. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingOrg(false);
    }
  };

  // Show loading while checking auth state
  if (loading || roleLoading || templateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show checkout redirect state
  if (user && organization && (isCreatingOrg || orgLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Redirecting to Checkout</h2>
          <p className="text-muted-foreground mb-4">
            Setting up your {template?.name || planSlug} plan...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
        </div>
      </div>
    );
  }

  // Calculate display price
  const monthlyPrice = template ? Math.round(template.monthly_price_cents / 100) : 79;
  const yearlyPrice = template?.annual_price_cents 
    ? Math.round(template.annual_price_cents / 100 / 12)
    : Math.round(monthlyPrice * 0.83);
  const displayPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                StayMoxie
              </span>
            </div>
            
            <CardTitle className="text-2xl">Start Your Free Trial</CardTitle>
            <CardDescription>
              {template?.name || 'Selected'} Plan • ${displayPrice}/mo
              {billingCycle === 'yearly' && (
                <span className="text-green-600 ml-1">(billed annually)</span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert className="mb-6 border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                14-day free trial. No credit card required to start.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  disabled={isLoading || isCreatingOrg}
                  placeholder="John Smith"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-company">Company Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="signup-company"
                  type="text"
                  value={signupData.companyName}
                  onChange={(e) => setSignupData(prev => ({ ...prev, companyName: e.target.value }))}
                  disabled={isLoading || isCreatingOrg}
                  placeholder="Acme Rentals"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isLoading || isCreatingOrg}
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
                  disabled={isLoading || isCreatingOrg}
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 text-lg" 
                disabled={isLoading || isCreatingOrg}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : isCreatingOrg ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              Already have an account?{' '}
              <a href={`/auth?redirect=/signup?plan=${planSlug}&billing=${billingCycle}`} className="underline text-emerald-600">
                Log in
              </a>
            </p>
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              By signing up, you agree to our{' '}
              <a href="/terms" className="underline">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Plan Details (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="mb-8">
            <span className="text-emerald-200 text-sm font-medium uppercase tracking-wider">
              {billingCycle === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
            </span>
            <h2 className="text-4xl font-bold mt-2 font-fraunces">
              {template?.name || 'Starter'} Plan
            </h2>
            <p className="text-emerald-100 mt-2">
              {template?.description || 'Everything you need to get started'}
            </p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">${displayPrice}</span>
              <span className="text-emerald-200">/month</span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-emerald-200 text-sm mt-1">
                Billed annually (${template?.annual_price_cents ? Math.round(template.annual_price_cents / 100) : yearlyPrice * 12}/year)
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What's included:</h3>
            {(template?.features || [
              'Direct booking engine',
              'Multi-channel calendar sync',
              'AI-powered guest messaging',
              'Local content hub',
              'Email support',
            ]).map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-400/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="font-semibold">14-Day Free Trial</span>
            </div>
            <p className="text-emerald-100 text-sm">
              Try all features free for 14 days. Cancel anytime, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformGetStarted;
