import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAutoCompleteOnboarding } from '@/hooks/useAutoCompleteOnboarding';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2, Rocket, Settings, Palette, Phone, Home, CreditCard, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';

const STEP_CONFIG = {
  branding: {
    title: 'Branding & Appearance',
    description: 'Set up your logo, colors, and visual identity',
    icon: Palette,
    settingsLink: '/admin/settings/branding',
  },
  contact: {
    title: 'Contact Information',
    description: 'Add your contact details and business information',
    icon: Phone,
    settingsLink: '/admin/settings/contact',
  },
  property: {
    title: 'First Property',
    description: 'Add your first vacation rental property',
    icon: Home,
    settingsLink: '/admin/properties',
  },
  payments: {
    title: 'Payment Setup',
    description: 'Configure payment processing with Stripe',
    icon: CreditCard,
    settingsLink: '/admin/settings/stripe',
  },
};

const SetupWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { steps, loading: stepsLoading, completedSteps, totalSteps, isComplete } = useOnboarding(organization?.id);
  
  // Auto-complete steps based on existing data
  const { isChecking } = useAutoCompleteOnboarding(organization?.id);

  if (orgLoading || stepsLoading || isChecking) {
    return (
      <SettingsSidebarLayout title="Setup Wizard" description="Complete your organization setup">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SettingsSidebarLayout>
    );
  }

  if (!organization) {
    return (
      <SettingsSidebarLayout title="Setup Wizard" description="Complete your organization setup">
        <Card>
          <CardHeader>
            <CardTitle>No Organization</CardTitle>
            <CardDescription>You need to create an organization first.</CardDescription>
          </CardHeader>
        </Card>
      </SettingsSidebarLayout>
    );
  }

  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <SettingsSidebarLayout 
      title="Setup Wizard" 
      description="Complete these steps to fully configure your vacation rental site"
    >
      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Setup Progress</CardTitle>
                <CardDescription>
                  {isComplete 
                    ? 'All steps completed!' 
                    : `${completedSteps} of ${totalSteps} steps completed`
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isComplete ? 'default' : 'secondary'}>
                {isComplete ? 'Complete' : 'In Progress'}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/admin/dashboard')}
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <div className="space-y-4">
        {Object.entries(STEP_CONFIG).map(([stepName, config]) => {
          const step = steps?.find(s => s.step_name === stepName);
          const isStepComplete = step?.completed ?? false;
          const Icon = config.icon;

          return (
            <Card key={stepName} className={isStepComplete ? 'border-primary/20 bg-primary/5' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isStepComplete ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{config.title}</CardTitle>
                        {isStepComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {config.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant={isStepComplete ? 'outline' : 'default'}
                    size="sm"
                    asChild
                  >
                    <Link to={config.settingsLink}>
                      <Settings className="h-4 w-4 mr-2" />
                      {isStepComplete ? 'Review' : 'Configure'}
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {isComplete && (
        <Card className="mt-6 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">Setup Complete!</h3>
              <p className="text-muted-foreground mb-4">
                Your vacation rental site is fully configured. You can always return here to make changes.
              </p>
              <Button asChild>
                <Link to="/admin/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </SettingsSidebarLayout>
  );
};

export default SetupWizardPage;
