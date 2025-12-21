import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  templateId?: string;
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
    
    console.log('[Onboarding] Starting organization creation:', params.name);
    
    try {
      // Step 1: Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('[Onboarding] Auth error:', authError);
        throw new Error('Authentication failed. Please log in again.');
      }
      if (!user) {
        throw new Error('Not authenticated. Please log in.');
      }
      console.log('[Onboarding] User authenticated:', user.id);

      // Step 2: Check slug availability
      console.log('[Onboarding] Checking slug availability:', params.slug);
      const { data: slugAvailable, error: slugError } = await supabase
        .rpc('is_slug_available', { _slug: params.slug });

      if (slugError) {
        console.error('[Onboarding] Slug check error:', slugError);
        throw new Error('Failed to verify URL availability. Please try again.');
      }

      if (!slugAvailable) {
        const errorMsg = 'This URL slug is already taken. Please choose a different one.';
        setError(errorMsg);
        toast({ title: 'URL Taken', description: errorMsg, variant: 'destructive' });
        return null;
      }
      console.log('[Onboarding] Slug available:', params.slug);

      // Step 3: Create organization with all related records
      console.log('[Onboarding] Creating organization with template:', params.templateId);
      const { data: orgId, error: createError } = await supabase
        .rpc('create_organization_with_owner', {
          _name: params.name,
          _slug: params.slug,
          _user_id: user.id,
          _template_id: params.templateId || null,
        });

      if (createError) {
        console.error('[Onboarding] Organization creation error:', createError);
        throw new Error(`Failed to create organization: ${createError.message}`);
      }

      if (!orgId) {
        throw new Error('Organization was created but no ID was returned. Please contact support.');
      }

      console.log('[Onboarding] Organization created successfully:', orgId);

      // Step 4: Verify the organization was created with settings
      const { data: verifyOrg, error: verifyError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('id', orgId)
        .single();

      if (verifyError || !verifyOrg) {
        console.error('[Onboarding] Verification error:', verifyError);
        throw new Error('Organization created but verification failed. Please refresh and try again.');
      }

      // Step 5: Verify site_settings were created
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('key')
        .eq('organization_id', orgId)
        .limit(5);

      if (settingsError) {
        console.warn('[Onboarding] Settings verification warning:', settingsError);
      } else {
        console.log('[Onboarding] Settings created:', settings?.length, 'records');
      }

      // Step 6: Verify onboarding steps were created
      const { data: onboardingSteps, error: onboardingError } = await supabase
        .from('organization_onboarding')
        .select('step_name')
        .eq('organization_id', orgId);

      if (onboardingError) {
        console.warn('[Onboarding] Onboarding steps verification warning:', onboardingError);
      } else {
        console.log('[Onboarding] Onboarding steps created:', onboardingSteps?.map(s => s.step_name));
      }

      toast({ 
        title: 'Organization created!', 
        description: 'Setting up your site. Redirecting to onboarding...' 
      });
      
      // Invalidate all caches to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-steps'] });
      
      console.log('[Onboarding] Organization creation complete, returning ID:', orgId);
      return orgId as string;
      
    } catch (error: any) {
      const errorMsg = error.message || 'An unexpected error occurred. Please try again.';
      console.error('[Onboarding] Creation failed:', error);
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
        console.error('[Onboarding] Slug availability check failed:', error);
        return false;
      }
      return data as boolean;
    } catch (error) {
      console.error('[Onboarding] Slug availability check error:', error);
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
