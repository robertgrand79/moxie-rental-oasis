
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorDetail {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  page: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  userAgent?: string;
  userId?: string;
}

export const useErrorTracking = () => {
  const queryClient = useQueryClient();

  const { data: errors = [] } = useQuery<ErrorDetail[]>({
    queryKey: ['error_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((log): ErrorDetail => {
        let page = '/';
        if (log.url) {
          try {
            page = new URL(log.url).pathname;
          } catch {
            page = log.url;
          }
        } else if (log.context && typeof log.context === 'object' && 'page' in log.context) {
          page = String((log.context as any).page);
        }
        
        let severity: 'critical' | 'warning' | 'info' = 'info';
        if (log.severity === 'critical' || log.severity === 'high') {
          severity = 'critical';
        } else if (log.severity === 'medium') {
          severity = 'warning';
        }

        let status: 'active' | 'resolved' | 'acknowledged' = 'active';
        if (log.resolved) {
          status = 'resolved';
        } else if (log.tags?.includes('acknowledged')) {
          status = 'acknowledged';
        }

        const contextObj = log.context ? (log.context as Record<string, any>) : {};

        return {
          id: log.id,
          message: log.message,
          stack: log.stack || undefined,
          timestamp: new Date(log.created_at),
          page,
          severity,
          status,
          userAgent: log.user_agent || undefined,
          userId: contextObj.userId || undefined,
        };
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (errorId: string) => {
      const { error } = await supabase
        .from('error_logs')
        .update({ resolved: true })
        .eq('id', errorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error_logs'] });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (errorId: string) => {
      const { data, error: fetchErr } = await supabase
        .from('error_logs')
        .select('tags')
        .eq('id', errorId)
        .single();
      
      if (fetchErr) throw fetchErr;
      
      const currentTags = data.tags || [];
      if (!currentTags.includes('acknowledged')) {
        const newTags = [...currentTags, 'acknowledged'];
        const { error: updateErr } = await supabase
          .from('error_logs')
          .update({ tags: newTags })
          .eq('id', errorId);
        if (updateErr) throw updateErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error_logs'] });
    },
  });

  const getActiveErrorCount = () => {
    return errors.filter(error => error.status === 'active').length;
  };

  const getCriticalErrorCount = () => {
    return errors.filter(error => error.status === 'active' && error.severity === 'critical').length;
  };

  return {
    errors,
    resolveError: (errorId: string) => resolveMutation.mutate(errorId),
    acknowledgeError: (errorId: string) => acknowledgeMutation.mutate(errorId),
    getActiveErrorCount,
    getCriticalErrorCount
  };
};

