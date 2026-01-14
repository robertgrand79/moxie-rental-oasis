import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  category: 'feature' | 'improvement' | 'bug-fix' | 'infrastructure' | 'security' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'idea' | 'planned' | 'in-progress' | 'completed' | 'on-hold';
  phase: string | null;
  target_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapItemInput {
  title: string;
  description?: string | null;
  category?: RoadmapItem['category'];
  priority?: RoadmapItem['priority'];
  status?: RoadmapItem['status'];
  phase?: string | null;
  target_date?: string | null;
  notes?: string | null;
}

export interface RoadmapFilters {
  status?: RoadmapItem['status'] | 'all';
  priority?: RoadmapItem['priority'] | 'all';
  category?: RoadmapItem['category'] | 'all';
  phase?: string | 'all';
  search?: string;
}

export interface RoadmapStats {
  total: number;
  byStatus: Record<RoadmapItem['status'], number>;
  byPriority: Record<RoadmapItem['priority'], number>;
  byCategory: Record<RoadmapItem['category'], number>;
}

export function usePlatformRoadmap(filters?: RoadmapFilters) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all roadmap items
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['platform-roadmap', filters],
    queryFn: async () => {
      let query = supabase
        .from('platform_roadmap_items')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.phase && filters.phase !== 'all') {
        query = query.eq('phase', filters.phase);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RoadmapItem[];
    },
  });

  // Calculate stats
  const stats: RoadmapStats = {
    total: items.length,
    byStatus: {
      'idea': items.filter(i => i.status === 'idea').length,
      'planned': items.filter(i => i.status === 'planned').length,
      'in-progress': items.filter(i => i.status === 'in-progress').length,
      'completed': items.filter(i => i.status === 'completed').length,
      'on-hold': items.filter(i => i.status === 'on-hold').length,
    },
    byPriority: {
      'critical': items.filter(i => i.priority === 'critical').length,
      'high': items.filter(i => i.priority === 'high').length,
      'medium': items.filter(i => i.priority === 'medium').length,
      'low': items.filter(i => i.priority === 'low').length,
    },
    byCategory: {
      'feature': items.filter(i => i.category === 'feature').length,
      'improvement': items.filter(i => i.category === 'improvement').length,
      'bug-fix': items.filter(i => i.category === 'bug-fix').length,
      'infrastructure': items.filter(i => i.category === 'infrastructure').length,
      'security': items.filter(i => i.category === 'security').length,
      'performance': items.filter(i => i.category === 'performance').length,
    },
  };

  // Get unique phases
  const phases = [...new Set(items.map(i => i.phase).filter(Boolean))] as string[];

  // Create item
  const createItem = useMutation({
    mutationFn: async (input: RoadmapItemInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('platform_roadmap_items')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-roadmap'] });
      toast({ title: 'Roadmap item created' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create item', description: error.message, variant: 'destructive' });
    },
  });

  // Update item
  const updateItem = useMutation({
    mutationFn: async ({ id, ...input }: Partial<RoadmapItem> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...input };
      
      // If status is being changed to completed, set completed_at
      if (input.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (input.status) {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('platform_roadmap_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-roadmap'] });
      toast({ title: 'Roadmap item updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update item', description: error.message, variant: 'destructive' });
    },
  });

  // Delete item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_roadmap_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-roadmap'] });
      toast({ title: 'Roadmap item deleted' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete item', description: error.message, variant: 'destructive' });
    },
  });

  return {
    items,
    stats,
    phases,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
  };
}
