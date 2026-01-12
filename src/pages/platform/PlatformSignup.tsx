import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationTemplates, OrganizationTemplate } from '@/hooks/useOrganizationTemplates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Building2,
  Package,
  Mail
} from 'lucide-react';
import { TemplateCard } from '@/components/signup/TemplateCard';
import { TemplatePreviewDrawer } from '@/components/signup/TemplatePreviewDrawer';

// Interface for pending organization data stored in localStorage
export interface PendingOrganizationData {
  name: string;
  slug: string;
  templateId: string;
  includeDemoData: boolean;
}

const PlatformSignup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Personal info
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    phone: '' 
  });
  
  // Organization info
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [selectedTemplate, setSelectedTemplate] = useState<OrganizationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<OrganizationTemplate | null>(null);
  const [includeDemoData, setIncludeDemoData] = useState(true);
  
  const { signUp, user, loading, roleLoading } = useAuth();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { data: templates, isLoading: loadingTemplates } = useOrganizationTemplates();
  const navigate = useNavigate();

  // Redirect authenticated users based on organization status
  useEffect(() => {
    if (user && !loading && !roleLoading && !orgLoading) {
      if (organization?.slug) {
        window.location.href = `/admin?org=${organization.slug}`;
      } else {
        // User is logged in but no org - they might have pending data
        const pending = localStorage.getItem('pendingOrganization');
        if (pending) {
          // Redirect to complete org creation
          navigate('/signup', { replace: true });
        }
      }
    }
  }, [user, loading, roleLoading, orgLoading, organization, navigate]);

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

  // When template is selected, sync its demo data default
  useEffect(() => {
    if (selectedTemplate) {
      setIncludeDemoData(selectedTemplate.include_demo_data && selectedTemplate.source_organization_id != null);
    }
  }, [selectedTemplate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!signupData.fullName || !signupData.email || !signupData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name, email, and password.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!orgName || !slug || slugStatus !== 'available') {
      toast({
        title: 'Missing Organization Info',
        description: 'Please enter your business name and ensure the URL is available.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedTemplate) {
      toast({
        title: 'Select a Template',
        description: 'Please choose a template for your site.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Store pending organization data BEFORE signup
      const pendingData: PendingOrganizationData = {
        name: orgName,
        slug,
        templateId: selectedTemplate.id,
        includeDemoData
      };
      localStorage.setItem('pendingOrganization', JSON.stringify(pendingData));
      
      // Perform signup
      const { error } = await signUp(
        signupData.email, 
        signupData.password, 
        signupData.fullName, 
        signupData.phone || undefined
      );
      
      if (error) {
        // Clear pending data on signup error
        localStorage.removeItem('pendingOrganization');
        
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        }
        
        toast({
          title: 'Signup Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      } else {
        setEmailSent(true);
        toast({
          title: 'Check Your Email!',
          description: 'We sent you a verification link. Click it to activate your account.',
          duration: 10000,
        });
      }
    } catch (error) {
      localStorage.removeItem('pendingOrganization');
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user && (loading || roleLoading || orgLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We sent a verification link to <strong>{signupData.email}</strong>
            </p>
            <div className="space-y-4 text-left bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Click the link in your email to verify your account</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Your organization <strong>{orgName}</strong> will be created automatically</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">You'll land on your new dashboard ready to go!</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setEmailSent(false)}
                className="text-primary hover:underline"
              >
                try again
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasDemoDataAvailable = selectedTemplate?.include_demo_data && selectedTemplate?.source_organization_id != null;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6 py-4">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                StayMoxie
              </span>
            </div>
            <h1 className="text-2xl font-bold">Start Your Free Trial</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Set up your account and direct booking site in minutes
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Section 1: Personal Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Section 2: Business Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Your Business
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Section 3: Template Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  Choose Your Template
                </CardTitle>
                <CardDescription className="text-xs">
                  Select the template that best fits your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {templates?.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplate?.id === template.id}
                        onSelect={() => setSelectedTemplate(template)}
                        onPreview={() => setPreviewTemplate(template)}
                        compact
                      />
                    ))}
                  </div>
                )}

                {/* Demo Data Toggle */}
                {hasDemoDataAvailable && (
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-green-500/5 border-green-500/20">
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
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12 text-base" 
              disabled={isLoading || slugStatus === 'checking' || slugStatus === 'taken' || !selectedTemplate}
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
      </div>

      {/* Right Side - Benefits (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 items-center justify-center sticky top-0 h-screen">
        <div className="max-w-md text-white">
          <h2 className="text-3xl font-bold mb-8">
            Start growing your direct bookings today
          </h2>
          
          <div className="space-y-6">
            {[
              'Direct booking engine with Stripe payments',
              'Local content hub for SEO domination',
              'AI-powered guest messaging',
              'Smart home integration',
              'Multi-channel calendar sync',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-300 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur">
            <p className="text-white/90 italic mb-4">
              "Built by vacation rental operators for vacation rental operators. We know what it takes to grow direct bookings."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">The StayMoxie Team</div>
                <div className="text-sm text-white/70">Your direct booking partner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Drawer */}
      <TemplatePreviewDrawer
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(template) => setSelectedTemplate(template)}
      />
    </div>
  );
};

export default PlatformSignup;
