import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Loader2, Palette, Phone, Home, CreditCard, ArrowRight, PartyPopper } from 'lucide-react';
import OnboardingBrandingStep from '@/components/onboarding/OnboardingBrandingStep';
import OnboardingContactStep from '@/components/onboarding/OnboardingContactStep';
import OnboardingPropertyStep from '@/components/onboarding/OnboardingPropertyStep';
import OnboardingPaymentsStep from '@/components/onboarding/OnboardingPaymentsStep';

const STEP_CONFIG = {
  branding: {
    title: 'Branding',
    description: 'Set up your logo and colors',
    icon: Palette,
  },
  contact: {
    title: 'Contact Info',
    description: 'Add your contact details',
    icon: Phone,
  },
  property: {
    title: 'First Property',
    description: 'Add your first rental property',
    icon: Home,
  },
  payments: {
    title: 'Payments',
    description: 'Connect Stripe for payments',
    icon: CreditCard,
  },
};

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { steps, currentStep, completedSteps, totalSteps, isComplete, loading, completeStep, isCompleting } = useOnboarding(organization?.id ?? null);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  // Use current incomplete step or allow viewing any step
  const displayStep = activeStep || currentStep;

  // Redirect to signup if no organization (after loading completes)
  useEffect(() => {
    if (!orgLoading && !loading && !organization) {
      window.location.href = '/signup';
    }
  }, [organization, orgLoading, loading]);

  if (orgLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    // Show loading while redirect happens via useEffect
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">You're All Set!</CardTitle>
            <CardDescription>
              Your organization is ready to go. Start managing your properties.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
              // Force a full page reload to ensure the organization context is refreshed
              window.location.href = '/admin/dashboard';
            }} className="w-full">
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleStepComplete = (stepName: string, data?: Record<string, any>) => {
    completeStep({ stepName, data });
    // Move to next incomplete step
    const stepOrder = ['branding', 'contact', 'property', 'payments'];
    const currentIndex = stepOrder.indexOf(stepName);
    const nextIncomplete = stepOrder.slice(currentIndex + 1).find(s => 
      !steps?.find(step => step.step_name === s)?.completed
    );
    setActiveStep(nextIncomplete || null);
  };

  const renderStepContent = () => {
    switch (displayStep) {
      case 'branding':
        return <OnboardingBrandingStep onComplete={(data) => handleStepComplete('branding', data)} isCompleting={isCompleting} />;
      case 'contact':
        return <OnboardingContactStep onComplete={(data) => handleStepComplete('contact', data)} isCompleting={isCompleting} />;
      case 'property':
        return <OnboardingPropertyStep onComplete={(data) => handleStepComplete('property', data)} isCompleting={isCompleting} />;
      case 'payments':
        return <OnboardingPaymentsStep onComplete={(data) => handleStepComplete('payments', data)} isCompleting={isCompleting} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to {organization.name}</h1>
          <p className="text-muted-foreground">Let's get your account set up in a few quick steps</p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm text-muted-foreground">{completedSteps} of {totalSteps} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          {/* Step Navigation */}
          <Card className="h-fit">
            <CardContent className="p-4 space-y-2">
              {steps?.map((step) => {
                const config = STEP_CONFIG[step.step_name as keyof typeof STEP_CONFIG];
                if (!config) return null;
                const Icon = config.icon;
                const isActive = displayStep === step.step_name;
                const isCompleted = step.completed;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.step_name)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : isCompleted 
                          ? 'text-muted-foreground hover:bg-muted' 
                          : 'hover:bg-muted'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : isActive 
                          ? 'bg-primary/20' 
                          : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{config.title}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {STEP_CONFIG[displayStep as keyof typeof STEP_CONFIG]?.title || 'Setup'}
              </CardTitle>
              <CardDescription>
                {STEP_CONFIG[displayStep as keyof typeof STEP_CONFIG]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Skip option */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            Skip for now and go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
