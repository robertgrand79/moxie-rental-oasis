import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TurnoProblem, TurnoProblemsFilters, TurnoProblemsStats } from '@/types/turnoProblems';

export function useTurnoProblems(filters?: TurnoProblemsFilters) {
  const [problems, setProblems] = useState<TurnoProblem[]>([]);
  const [stats, setStats] = useState<TurnoProblemsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('turno_problems')
        .select(`
          *,
          linked_work_order:work_orders(id, work_order_number, status)
        `)
        .order('turno_updated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.sync_status) {
        query = query.eq('sync_status', filters.sync_status);
      }
      if (filters?.property_id) {
        query = query.eq('turno_property_id', filters.property_id);
      }
      if (filters?.has_work_order !== undefined) {
        if (filters.has_work_order) {
          query = query.not('linked_work_order_id', 'is', null);
        } else {
          query = query.is('linked_work_order_id', null);
        }
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,property_address.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProblems((data || []) as TurnoProblem[]);
    } catch (err) {
      console.error('Error fetching Turno problems:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch problems');
      toast({
        title: 'Error',
        description: 'Failed to fetch Turno problems',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error: statsError } = await supabase
        .from('turno_problems')
        .select('status, sync_status, linked_work_order_id, last_sync_at');

      if (statsError) {
        throw statsError;
      }

      const stats: TurnoProblemsStats = {
        total: data.length,
        open: data.filter(p => p.status === 'open').length,
        in_progress: data.filter(p => p.status === 'in_progress').length,
        resolved: data.filter(p => p.status === 'resolved').length,
        closed: data.filter(p => p.status === 'closed').length,
        linked_to_work_orders: data.filter(p => p.linked_work_order_id).length,
        sync_conflicts: data.filter(p => p.sync_status === 'conflict').length,
        last_sync_at: data.length > 0 ? Math.max(...data.map(p => new Date(p.last_sync_at).getTime())).toString() : undefined,
      };

      setStats(stats);
    } catch (err) {
      console.error('Error fetching Turno problems stats:', err);
    }
  };

  const updateProblem = async (id: string, updates: Partial<TurnoProblem>) => {
    try {
      const { error } = await supabase
        .from('turno_problems')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchProblems();
      await fetchStats();

      toast({
        title: 'Success',
        description: 'Problem updated successfully',
      });
    } catch (err) {
      console.error('Error updating problem:', err);
      toast({
        title: 'Error',
        description: 'Failed to update problem',
        variant: 'destructive',
      });
    }
  };

  const linkToWorkOrder = async (problemId: string, workOrderId: string) => {
    try {
      const { error } = await supabase
        .from('turno_problems')
        .update({
          linked_work_order_id: workOrderId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', problemId);

      if (error) {
        throw error;
      }

      await fetchProblems();
      await fetchStats();

      toast({
        title: 'Success',
        description: 'Problem linked to work order successfully',
      });
    } catch (err) {
      console.error('Error linking problem to work order:', err);
      toast({
        title: 'Error',
        description: 'Failed to link problem to work order',
        variant: 'destructive',
      });
    }
  };

  const unlinkFromWorkOrder = async (problemId: string) => {
    try {
      const { error } = await supabase
        .from('turno_problems')
        .update({
          linked_work_order_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', problemId);

      if (error) {
        throw error;
      }

      await fetchProblems();
      await fetchStats();

      toast({
        title: 'Success',
        description: 'Problem unlinked from work order',
      });
    } catch (err) {
      console.error('Error unlinking problem from work order:', err);
      toast({
        title: 'Error',
        description: 'Failed to unlink problem from work order',
        variant: 'destructive',
      });
    }
  };

  const deleteProblems = async (problemIds: string[]) => {
    try {
      const { error } = await supabase
        .from('turno_problems')
        .delete()
        .in('id', problemIds);

      if (error) {
        throw error;
      }

      await fetchProblems();
      await fetchStats();

      toast({
        title: 'Success',
        description: `${problemIds.length} problem(s) deleted successfully`,
      });
    } catch (err) {
      console.error('Error deleting problems:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete problems',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, [filters]);

  return {
    problems,
    stats,
    loading,
    error,
    refreshProblems: fetchProblems,
    refreshStats: fetchStats,
    updateProblem,
    linkToWorkOrder,
    unlinkFromWorkOrder,
    deleteProblems,
  };
}