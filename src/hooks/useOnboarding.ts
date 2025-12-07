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
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

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

  const createOrganization = async (params: CreateOrganizationParams): Promise<string | null> => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check slug availability
      const { data: slugAvailable } = await supabase
        .rpc('is_slug_available', { _slug: params.slug });

      if (!slugAvailable) {
        toast({ title: 'Error', description: 'This URL slug is already taken', variant: 'destructive' });
        return null;
      }

      // Create organization with owner
      const { data: orgId, error } = await supabase
        .rpc('create_organization_with_owner', {
          _name: params.name,
          _slug: params.slug,
          _user_id: user.id,
          _template_id: params.templateId || null,
        });

      if (error) throw error;

      toast({ title: 'Organization created!', description: 'Starting onboarding...' });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      
      return orgId as string;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setCreating(false);
    }
  };

  const checkSlugAvailability = useCallback(async (slug: string): Promise<boolean> => {
    const { data } = await supabase.rpc('is_slug_available', { _slug: slug });
    return data as boolean;
  }, []);

  return {
    createOrganization,
    checkSlugAvailability,
    creating,
  };
};
