import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Sparkles, CheckCircle2, Mail } from 'lucide-react';
import { PlanSelectionStep } from '@/components/signup/PlanSelectionStep';
import { AccountDetailsStep } from '@/components/signup/AccountDetailsStep';

// Interface for site_templates data
interface SiteTemplate {
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

// Interface for pending organization data stored in localStorage
export interface PendingOrganizationData {
  name: string;
  slug: string;
  templateId: string;
  includeDemoData: boolean;
}

const PlatformSignup: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submittedOrgName, setSubmittedOrgName] = useState('');
  
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(null);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SiteTemplate | null>(null);
  
  const { signUp, user, loading, roleLoading } = useAuth();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const navigate = useNavigate();

  // Fetch templates from site_templates (same source as PlanSelectionStep)
  const { data: templates } = useQuery({
    queryKey: ['site-templates-signup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_templates')
        .select('*')
        .order('monthly_price_cents', { ascending: true });
      
      if (error) throw error;
      return data as unknown as SiteTemplate[];
    },
  });

  // Handle pre-selection from URL param (e.g., /platform/signup?plan=starter)
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && templates && !selectedPlanSlug) {
      const matchedTemplate = templates.find(
        t => t.slug === planParam || t.name.toLowerCase().includes(planParam.toLowerCase())
      );
      if (matchedTemplate) {
        setSelectedPlanSlug(matchedTemplate.slug);
        setSelectedTemplate(matchedTemplate);
        setCurrentStep(2);
        // Clean up URL
        searchParams.delete('plan');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [templates, searchParams, setSearchParams, selectedPlanSlug]);

  // Set selected template when plan is selected
  useEffect(() => {
    if (selectedPlanSlug && templates) {
      const template = templates.find(t => t.slug === selectedPlanSlug);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [selectedPlanSlug, templates]);

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

  const handleSelectPlan = (planSlug: string, isYearly: boolean) => {
    setSelectedPlanSlug(planSlug);
    setIsYearlyBilling(isYearly);
    setCurrentStep(2);
  };

  const handleBackToPlanSelection = () => {
    setCurrentStep(1);
  };

  const handleSignup = async (data: {
    signupData: { email: string; password: string; fullName: string; phone: string };
    orgName: string;
    slug: string;
    includeDemoData: boolean;
  }) => {
    if (!selectedTemplate) return;
    
    // Validate fields
    if (!data.signupData.fullName || !data.signupData.email || !data.signupData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name, email, and password.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!data.orgName || !data.slug) {
      toast({
        title: 'Missing Organization Info',
        description: 'Please enter your business name and site URL.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Store pending organization data BEFORE signup
      const pendingData: PendingOrganizationData = {
        name: data.orgName,
        slug: data.slug,
        templateId: selectedTemplate.id,
        includeDemoData: data.includeDemoData
      };
      localStorage.setItem('pendingOrganization', JSON.stringify(pendingData));
      
      // Perform signup
      const { error } = await signUp(
        data.signupData.email, 
        data.signupData.password, 
        data.signupData.fullName, 
        data.signupData.phone || undefined
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
        setSubmittedEmail(data.signupData.email);
        setSubmittedOrgName(data.orgName);
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
              We sent a verification link to <strong>{submittedEmail}</strong>
            </p>
            <div className="space-y-4 text-left bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Click the link in your email to verify your account</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Your organization <strong>{submittedOrgName}</strong> will be created automatically</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">You'll land on your new dashboard ready to go!</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => {
                  setEmailSent(false);
                  setCurrentStep(2);
                }}
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

  // Step 1: Full-page pricing view (matches homepage)
  if (currentStep === 1) {
    return <PlanSelectionStep onSelectPlan={handleSelectPlan} />;
  }

  // Step 2: Account details form
  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              StayMoxie
            </span>
          </Link>
        </div>

        {/* Account Details Step */}
        {selectedTemplate && (
          <AccountDetailsStep
            selectedTemplate={selectedTemplate}
            onBack={handleBackToPlanSelection}
            onSubmit={handleSignup}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default PlatformSignup;
