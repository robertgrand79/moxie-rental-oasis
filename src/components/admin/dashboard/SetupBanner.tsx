import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Rocket, X, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

const BANNER_DISMISSED_KEY = 'setup-banner-dismissed';

const SetupBanner: React.FC = () => {
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { completedSteps, totalSteps, isComplete, loading: stepsLoading } = useOnboarding(organization?.id);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed for this organization
    if (organization?.id) {
      const dismissedOrgs = JSON.parse(localStorage.getItem(BANNER_DISMISSED_KEY) || '[]');
      setIsDismissed(dismissedOrgs.includes(organization.id));
    }
  }, [organization?.id]);

  const handleDismiss = () => {
    if (organization?.id) {
      const dismissedOrgs = JSON.parse(localStorage.getItem(BANNER_DISMISSED_KEY) || '[]');
      if (!dismissedOrgs.includes(organization.id)) {
        dismissedOrgs.push(organization.id);
        localStorage.setItem(BANNER_DISMISSED_KEY, JSON.stringify(dismissedOrgs));
      }
      setIsDismissed(true);
    }
  };

  // Don't show if loading, dismissed, complete, or no organization
  if (orgLoading || stepsLoading || isDismissed || isComplete || !organization) {
    return null;
  }

  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 mb-6">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Complete Your Site Setup</h3>
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-2 flex-1 max-w-48" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {completedSteps}/{totalSteps} steps
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link to="/admin/settings/setup">
                Continue Setup
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupBanner;
