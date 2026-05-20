import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StepCompletionCheck {
  stepName: string;
  isDataPresent: boolean;
}

/**
 * Hook that checks existing data and auto-completes onboarding steps
 * when the required data already exists (e.g., from settings pages).
 */
export const useAutoCompleteOnboarding = (organizationId: string | null) => {
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  // Fetch all data needed to determine step completion
  const { data: completionData, isLoading } = useQuery({
    queryKey: ['auto-complete-check', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const [siteSettingsResult, orgResult, propertiesResult, onboardingStepsResult] = await Promise.all([
        supabase
          .from('site_settings')
          .select('key, value')
          .eq('organization_id', organizationId),
        supabase
          .from('organizations')
          .select('stripe_secret_key')
          .eq('id', organizationId)
          .single(),
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        supabase
          .from('organization_onboarding')
          .select('step_name, completed')
          .eq('organization_id', organizationId),
      ]);

      // Build settings map
      const settingsMap: Record<string, string> = {};
      if (siteSettingsResult.data) {
        for (const row of siteSettingsResult.data) {
          settingsMap[row.key] = row.value as string;
        }
      }

      // Build onboarding steps map
      const stepsMap: Record<string, boolean> = {};
      if (onboardingStepsResult.data) {
        for (const step of onboardingStepsResult.data) {
          stepsMap[step.step_name] = step.completed;
        }
      }

      return {
        settingsMap,
        organization: orgResult.data,
        propertiesCount: propertiesResult.count || 0,
        stepsMap,
      };
    },
    enabled: !!organizationId,
    staleTime: 5000,
  });

  // Mutation to complete a step
  const completeStepMutation = useMutation({
    mutationFn: async (stepName: string) => {
      if (!organizationId) throw new Error('No organization');

      const { error } = await supabase
        .from('organization_onboarding')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('organization_id', organizationId)
        .eq('step_name', stepName);

      if (error) throw error;

      // Check if all steps are now completed
      const { data: allSteps } = await supabase
        .from('organization_onboarding')
        .select('completed')
        .eq('organization_id', organizationId);

      const allCompleted = allSteps?.every(s => s.completed);

      if (allCompleted) {
        await supabase
          .from('organizations')
          .update({ onboarding_completed: true })
          .eq('id', organizationId);
      }

      return stepName;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-steps', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['auto-complete-check', organizationId] });
    },
  });

  // Determine which steps should be marked complete based on existing data
  const getStepsToComplete = (): StepCompletionCheck[] => {
    if (!completionData) return [];

    const { settingsMap, organization, propertiesCount, stepsMap } = completionData;

    const checks: StepCompletionCheck[] = [
      {
        stepName: 'branding',
        // The site name is auto-seeded from the org name when the org is
        // created (create_organization_with_owner), so it is always
        // present and is NOT evidence the user did the branding step --
        // including it here auto-completed branding for every org. Only
        // an uploaded logo counts. Legacy snake_case logo keys are kept
        // so pre-consolidation tenants who uploaded a logo still match.
        isDataPresent: !!(
          settingsMap.siteLogo ||
          settingsMap.logoUrl ||
          settingsMap.logo_url
        ),
      },
      {
        stepName: 'contact',
        isDataPresent: !!(
          settingsMap.contactEmail ||
          settingsMap.contact_email ||
          settingsMap.phone ||
          settingsMap.contact_phone ||
          settingsMap.contactPhone
        ),
      },
      {
        stepName: 'property',
        // Property is complete if at least one property exists
        isDataPresent: propertiesCount > 0,
      },
      {
        stepName: 'payments',
        // Payments is complete if Stripe is configured
        isDataPresent: !!organization?.stripe_secret_key,
      },
    ];

    // Filter to only steps that have data but aren't marked complete
    return checks.filter(check => 
      check.isDataPresent && stepsMap[check.stepName] === false
    );
  };

  // Auto-complete steps on mount (only once)
  useEffect(() => {
    if (!completionData || hasRun.current || isLoading) return;

    const stepsToComplete = getStepsToComplete();
    
    if (stepsToComplete.length > 0) {
      hasRun.current = true;
      
      // Complete all steps that have data
      Promise.all(
        stepsToComplete.map(step => completeStepMutation.mutateAsync(step.stepName))
      ).catch(console.error);
    }
  }, [completionData, isLoading]);

  return {
    isChecking: isLoading || completeStepMutation.isPending,
    stepsAutoCompleted: hasRun.current,
  };
};
