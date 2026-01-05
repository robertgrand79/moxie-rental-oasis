import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/services/monitoring/structuredLogger';

interface OnboardingStep {
  id: string;
  organization_id: string;
  step_name: string;
  completed: boolean;
  completed_at: string | null;
  data: Record<string, any>;
}

interface CreateOrganizationParams {
  name: string;
  slug: string;
  templateId?: string; // Legacy: organizations.is_template=true
  visualTemplateId?: string; // New: organization_templates.id
  includeDemoData?: boolean;
}

export const useOnboarding = (organizationId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch onboarding progress
  const { data: steps, isLoading } = useQuery({
    queryKey: ['onboarding-steps', organizationId],
    queryFn: async (): Promise<OnboardingStep[]> => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('organization_onboarding')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as OnboardingStep[];
    },
    enabled: !!organizationId,
  });

  // Fetch organization's onboarding_completed flag as fallback
  const { data: orgData } = useQuery({
    queryKey: ['organization-onboarding-status', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase
        .from('organizations')
        .select('onboarding_completed')
        .eq('id', organizationId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!organizationId,
  });

  // Complete a step
  const completeStep = useMutation({
    mutationFn: async ({ stepName, data }: { stepName: string; data?: Record<string, any> }) => {
      if (!organizationId) throw new Error('No organization');

      const { error } = await supabase
        .from('organization_onboarding')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          data: data || {},
        })
        .eq('organization_id', organizationId)
        .eq('step_name', stepName);

      if (error) throw error;

      // Check if all steps completed
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-steps', organizationId] });
      toast({ title: 'Step completed!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const currentStep = steps?.find(s => !s.completed)?.step_name || null;
  const completedSteps = steps?.filter(s => s.completed).length || 0;
  const totalSteps = steps?.length || 0;
  // Check both: all steps completed OR organization marked as complete (fallback for orgs without step records)
  const isComplete = (completedSteps === totalSteps && totalSteps > 0) || orgData?.onboarding_completed === true;

  return {
    steps,
    currentStep,
    completedSteps,
    totalSteps,
    isComplete,
    loading: isLoading,
    completeStep: completeStep.mutate,
    isCompleting: completeStep.isPending,
  };
};

export const useCreateOrganization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrganization = async (params: CreateOrganizationParams): Promise<string | null> => {
    setCreating(true);
    setError(null);
    
    logger.info('Starting organization creation', { 
      component: 'Onboarding', 
      orgName: params.name,
      visualTemplateId: params.visualTemplateId,
      includeDemoData: params.includeDemoData,
    });
    
    try {
      // Step 1: Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        logger.error('Auth error during org creation', new Error(authError.message), { component: 'Onboarding' });
        throw new Error('Authentication failed. Please log in again.');
      }
      if (!user) {
        throw new Error('Not authenticated. Please log in.');
      }
      logger.info('User authenticated for org creation', { component: 'Onboarding' });

      // Step 2: Check slug availability
      logger.debug('Checking slug availability', { component: 'Onboarding', slug: params.slug });
      const { data: slugAvailable, error: slugError } = await supabase
        .rpc('is_slug_available', { _slug: params.slug });

      if (slugError) {
        logger.error('Slug check error', new Error(slugError.message), { component: 'Onboarding' });
        throw new Error('Failed to verify URL availability. Please try again.');
      }

      if (!slugAvailable) {
        const errorMsg = 'This URL slug is already taken. Please choose a different one.';
        setError(errorMsg);
        toast({ title: 'URL Taken', description: errorMsg, variant: 'destructive' });
        return null;
      }
      logger.debug('Slug available', { component: 'Onboarding', slug: params.slug });

      // Step 3: Create organization with unified template system
      logger.info('Creating organization with unified template', { 
        component: 'Onboarding', 
        visualTemplateId: params.visualTemplateId,
        legacyTemplateId: params.templateId,
        includeDemoData: params.includeDemoData,
      });
      
      const { data: orgId, error: createError } = await supabase
        .rpc('create_organization_with_owner', {
          _name: params.name,
          _slug: params.slug,
          _user_id: user.id,
          _template_id: params.templateId || null, // Legacy fallback
          _visual_template_id: params.visualTemplateId || null, // New unified template
          _include_demo_data: params.includeDemoData ?? false,
        });

      if (createError) {
        logger.error('Organization creation error', new Error(createError.message), { component: 'Onboarding' });
        throw new Error(`Failed to create organization: ${createError.message}`);
      }

      if (!orgId) {
        throw new Error('Organization was created but no ID was returned. Please contact support.');
      }

      logger.info('Organization created successfully', { component: 'Onboarding', orgId });

      // Step 4: Verify the organization was created with settings
      const { data: verifyOrg, error: verifyError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('id', orgId)
        .single();

      if (verifyError || !verifyOrg) {
        logger.error('Verification error', verifyError ? new Error(verifyError.message) : undefined, { component: 'Onboarding' });
        throw new Error('Organization created but verification failed. Please refresh and try again.');
      }

      // Step 5: Verify site_settings were created
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('key')
        .eq('organization_id', orgId)
        .limit(5);

      if (settingsError) {
        logger.warn('Settings verification warning', { component: 'Onboarding', error: settingsError.message });
      } else {
        logger.debug('Settings created', { component: 'Onboarding', count: settings?.length });
      }

      // Step 6: Verify onboarding steps were created
      const { data: onboardingSteps, error: onboardingError } = await supabase
        .from('organization_onboarding')
        .select('step_name')
        .eq('organization_id', orgId);

      if (onboardingError) {
        logger.warn('Onboarding steps verification warning', { component: 'Onboarding', error: onboardingError.message });
      } else {
        logger.debug('Onboarding steps created', { component: 'Onboarding', steps: onboardingSteps?.map(s => s.step_name) });
      }

      toast({ 
        title: 'Organization created!', 
        description: params.includeDemoData 
          ? 'Your site is ready with sample content. Redirecting...'
          : 'Setting up your site. Redirecting to dashboard...' 
      });
      
      // Invalidate all caches to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-steps'] });
      
      logger.info('Organization creation complete', { component: 'Onboarding', orgId });
      return orgId as string;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      logger.error('Creation failed', error instanceof Error ? error : undefined, { component: 'Onboarding' });
      setError(errorMsg);
      toast({ 
        title: 'Organization Creation Failed', 
        description: errorMsg, 
        variant: 'destructive' 
      });
      return null;
    } finally {
      setCreating(false);
    }
  };

  const checkSlugAvailability = useCallback(async (slug: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_slug_available', { _slug: slug });
      if (error) {
        logger.error('Slug availability check failed', new Error(error.message), { component: 'Onboarding' });
        return false;
      }
      return data as boolean;
    } catch (error) {
      logger.error('Slug availability check error', error instanceof Error ? error : undefined, { component: 'Onboarding' });
      return false;
    }
  }, []);

  return {
    createOrganization,
    checkSlugAvailability,
    creating,
    error,
  };
};
