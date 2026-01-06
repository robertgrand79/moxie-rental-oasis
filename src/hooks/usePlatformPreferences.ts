import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlatformPreferences {
  id: string;
  user_id: string;
  starred_sections: string[];
  sidebar_collapsed: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_STARRED = ['organizations', 'support'];

export const usePlatformPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['platform-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('platform_admin_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching platform preferences:', error);
        throw error;
      }

      return data as PlatformPreferences | null;
    },
    enabled: !!user?.id,
  });

  const createPreferencesMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('platform_admin_preferences')
        .insert({ 
          user_id: user.id,
          starred_sections: DEFAULT_STARRED 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-preferences'] });
    },
  });

  const updateStarredMutation = useMutation({
    mutationFn: async (sections: string[]) => {
      if (!user?.id) throw new Error('No user');

      // Upsert preferences
      const { data, error } = await supabase
        .from('platform_admin_preferences')
        .upsert({ 
          user_id: user.id,
          starred_sections: sections,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-preferences'] });
    },
  });

  const updateSidebarCollapsedMutation = useMutation({
    mutationFn: async (collapsed: boolean) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('platform_admin_preferences')
        .upsert({ 
          user_id: user.id,
          sidebar_collapsed: collapsed,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-preferences'] });
    },
  });

  const starredSections = preferences?.starred_sections ?? DEFAULT_STARRED;
  const sidebarCollapsed = preferences?.sidebar_collapsed ?? false;

  const toggleStarSection = (sectionKey: string) => {
    const current = starredSections;
    const newStarred = current.includes(sectionKey)
      ? current.filter(s => s !== sectionKey)
      : [...current, sectionKey];
    
    updateStarredMutation.mutate(newStarred);
  };

  const isStarred = (sectionKey: string) => starredSections.includes(sectionKey);

  const setSidebarCollapsed = (collapsed: boolean) => {
    updateSidebarCollapsedMutation.mutate(collapsed);
  };

  return {
    starredSections,
    sidebarCollapsed,
    isLoading,
    toggleStarSection,
    isStarred,
    setSidebarCollapsed,
    isUpdating: updateStarredMutation.isPending || updateSidebarCollapsedMutation.isPending,
  };
};
