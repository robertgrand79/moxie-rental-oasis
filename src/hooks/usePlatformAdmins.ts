import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformAdmin {
  id: string;
  user_id: string;
  role: 'platform_admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  // Joined profile data
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export const usePlatformAdmins = (activeOnly: boolean = true) => {
  const { data: admins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['platform-admins', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('platform_admins')
        .select(`
          id,
          user_id,
          role,
          is_active,
          created_at,
          profiles!inner (
            email,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((admin: any) => ({
        id: admin.id,
        user_id: admin.user_id,
        role: admin.role,
        is_active: admin.is_active,
        created_at: admin.created_at,
        email: admin.profiles?.email || null,
        full_name: admin.profiles?.full_name || null,
        avatar_url: admin.profiles?.avatar_url || null,
      })) as PlatformAdmin[];
    },
  });

  return {
    admins,
    isLoading,
    error,
    refetch,
  };
};
