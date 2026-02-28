import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { debug } from '@/utils/debug';

export interface WorkOrder {
  id: string;
  work_order_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  property_id?: string;
  contractor_id?: string;
  assigned_user_id?: string;
  estimated_cost?: number;
  actual_cost?: number;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  scope_of_work?: string;
  special_instructions?: string;
  attachments?: string[];
  completion_photos?: string[];
  invoice_attachments?: string[];
  requires_permits?: boolean;
  access_code?: string;
  sent_at?: string;
  acknowledged_at?: string;
  completed_at?: string;
  contractor_notes?: string;
  billing_type?: string;
  billing_rate?: number;
  hours_worked?: number;
  billing_amount?: number;
  payment_status?: string;
  paid_at?: string;
  payment_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    location: string;
  };
  contractor?: {
    id: string;
    name: string;
    company_name?: string;
    email: string;
    phone?: string;
    hourly_rate?: number;
    default_billing_type?: string;
  };
  assigned_user?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface Contractor {
  id: string;
  organization_id?: string;
  name: string;
  company_name?: string;
  email: string;
  phone?: string;
  address?: string;
  specialties?: string[];
  rating?: number;
  notes?: string;
  is_active: boolean;
  sms_opt_in?: boolean;
  hourly_rate?: number;
  default_billing_type?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const WORK_ORDER_SELECT = `
  *,
  property:properties(*),
  contractor:contractors(*),
  assigned_user:profiles!work_orders_assigned_user_id_fkey(id, full_name, email)
`;

export const workOrderKeys = {
  all: (orgId: string) => ['work-orders', orgId] as const,
  contractors: (orgId: string) => ['contractors', orgId] as const,
};

const fetchWorkOrdersFn = async (organizationId: string) => {
  const { data: orgProperties, error: propError } = await supabase
    .from('properties')
    .select('id')
    .eq('organization_id', organizationId);

  if (propError) throw propError;
  const propertyIds = orgProperties?.map(p => p.id) || [];
  if (propertyIds.length === 0) return [];

  const { data, error } = await supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as WorkOrder[]) || [];
};

const fetchContractorsFn = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return (data as Contractor[]) || [];
};

export const useWorkOrderManagement = () => {
  const { toast } = useToast();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const workOrdersQuery = useQuery({
    queryKey: workOrderKeys.all(orgId || ''),
    queryFn: () => fetchWorkOrdersFn(orgId!),
    enabled: !!orgId && !orgLoading,
    staleTime: 2 * 60 * 1000,
  });

  const contractorsQuery = useQuery({
    queryKey: workOrderKeys.contractors(orgId || ''),
    queryFn: () => fetchContractorsFn(orgId!),
    enabled: !!orgId && !orgLoading,
    staleTime: 5 * 60 * 1000,
  });

  const invalidateAll = () => {
    if (!orgId) return;
    queryClient.invalidateQueries({ queryKey: workOrderKeys.all(orgId) });
    queryClient.invalidateQueries({ queryKey: workOrderKeys.contractors(orgId) });
  };

  const createWorkOrderMutation = useMutation({
    mutationFn: async (workOrderData: Omit<WorkOrder, 'id' | 'work_order_number' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'contractor'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { property, contractor, assigned_user, ...cleanData } = workOrderData as any;

      let organizationId = cleanData.organization_id;
      if (!organizationId && cleanData.property_id) {
        const { data: propertyData } = await supabase
          .from('properties')
          .select('organization_id')
          .eq('id', cleanData.property_id)
          .single();
        organizationId = propertyData?.organization_id;
      }
      if (!organizationId && orgId) {
        organizationId = orgId;
      }

      const { data, error } = await supabase
        .from('work_orders')
        .insert({ ...cleanData, organization_id: organizationId, created_by: user.id })
        .select(WORK_ORDER_SELECT)
        .single();

      if (error) throw error;
      return data as WorkOrder;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.all(orgId || '') });
      toast({ title: 'Success', description: 'Work order created successfully' });

      // Create notifications
      if (orgId && data) {
        const propertyName = data.property?.title || 'Unknown Property';
        if (!data.assigned_user_id) {
          await supabase.from('admin_notifications').insert({
            organization_id: orgId,
            user_id: null,
            notification_type: 'work_order_created',
            category: 'operations',
            title: 'New Work Order Created',
            message: `Work order "${data.title}" created for ${propertyName}`,
            action_url: `/admin/work-orders?id=${data.id}`,
            priority: data.priority === 'urgent' || data.priority === 'critical' ? 'high' : 'normal',
            metadata: { work_order_id: data.id, work_order_number: data.work_order_number, property_id: data.property_id, priority: data.priority }
          });
        }
        if (data.assigned_user_id) {
          await supabase.from('admin_notifications').insert({
            organization_id: orgId,
            user_id: data.assigned_user_id,
            notification_type: 'work_order_assigned',
            category: 'operations',
            title: 'Work Order Assigned to You',
            message: `You've been assigned to "${data.title}" at ${propertyName}`,
            action_url: `/admin/work-orders?id=${data.id}`,
            priority: data.priority === 'critical' || data.priority === 'high' ? 'high' : 'normal',
            metadata: { work_order_id: data.id, work_order_number: data.work_order_number, property_id: data.property_id, priority: data.priority }
          });
        }
      }
    },
    onError: (error) => {
      debug.error('Error creating work order:', error);
      toast({ title: 'Error', description: 'Failed to create work order', variant: 'destructive' });
    },
  });

  const updateWorkOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WorkOrder> }) => {
      const currentWorkOrder = workOrdersQuery.data?.find(wo => wo.id === id);
      const { property, contractor, assigned_user, ...cleanUpdates } = updates as any;

      const { data, error } = await supabase
        .from('work_orders')
        .update(cleanUpdates)
        .eq('id', id)
        .select(WORK_ORDER_SELECT)
        .single();

      if (error) throw error;
      return { data: data as WorkOrder, previousAssignee: currentWorkOrder?.assigned_user_id, previousStatus: currentWorkOrder?.status };
    },
    onSuccess: async ({ data, previousAssignee, previousStatus }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.all(orgId || '') });
      toast({ title: 'Success', description: 'Work order updated successfully' });

      if (orgId && data) {
        const propertyName = data.property?.title || 'Unknown Property';
        if (previousStatus !== 'completed' && data.status === 'completed') {
          await supabase.from('admin_notifications').insert({
            organization_id: orgId, user_id: null, notification_type: 'work_order_completed', category: 'operations',
            title: 'Work Order Completed', message: `Work order "${data.title}" at ${propertyName} has been completed`,
            action_url: `/admin/work-orders?id=${data.id}`, priority: 'normal',
            metadata: { work_order_id: data.id, work_order_number: data.work_order_number, property_id: data.property_id }
          });
        }
        if (data.assigned_user_id && data.assigned_user_id !== previousAssignee) {
          await supabase.from('admin_notifications').insert({
            organization_id: orgId, user_id: data.assigned_user_id, notification_type: 'work_order_assigned', category: 'operations',
            title: 'Work Order Assigned to You', message: `You've been assigned to "${data.title}" at ${propertyName}`,
            action_url: `/admin/work-orders?id=${data.id}`,
            priority: data.priority === 'critical' || data.priority === 'high' ? 'high' : 'normal',
            metadata: { work_order_id: data.id, work_order_number: data.work_order_number, property_id: data.property_id, priority: data.priority }
          });
        }
      }
    },
    onError: (error) => {
      debug.error('Error updating work order:', error);
      toast({ title: 'Error', description: 'Failed to update work order', variant: 'destructive' });
    },
  });

  const deleteWorkOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('work_orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.all(orgId || '') });
      toast({ title: 'Success', description: 'Work order deleted successfully' });
    },
    onError: (error) => {
      debug.error('Error deleting work order:', error);
      toast({ title: 'Error', description: 'Failed to delete work order', variant: 'destructive' });
    },
  });

  const createContractorMutation = useMutation({
    mutationFn: async (contractorData: Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      if (!orgId) throw new Error('Organization not loaded');

      const { data, error } = await supabase
        .from('contractors')
        .insert({ ...contractorData, created_by: user.id, organization_id: orgId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.contractors(orgId || '') });
      toast({ title: 'Success', description: 'Contractor created successfully' });
    },
    onError: (error) => {
      debug.error('Error creating contractor:', error);
      toast({ title: 'Error', description: 'Failed to create contractor', variant: 'destructive' });
    },
  });

  const updateContractorMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contractor> }) => {
      const { data, error } = await supabase.from('contractors').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.contractors(orgId || '') });
      toast({ title: 'Success', description: 'Contractor updated successfully' });
    },
    onError: (error) => {
      debug.error('Error updating contractor:', error);
      toast({ title: 'Error', description: 'Failed to update contractor', variant: 'destructive' });
    },
  });

  const deleteContractorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contractors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.contractors(orgId || '') });
      toast({ title: 'Success', description: 'Contractor deleted successfully' });
    },
    onError: (error) => {
      debug.error('Error deleting contractor:', error);
      toast({ title: 'Error', description: 'Failed to delete contractor', variant: 'destructive' });
    },
  });

  // Backward-compatible API wrappers
  const createWorkOrder = (data: any) => createWorkOrderMutation.mutateAsync(data);
  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => updateWorkOrderMutation.mutateAsync({ id, updates }).then(r => r.data);
  const deleteWorkOrder = (id: string) => deleteWorkOrderMutation.mutateAsync(id);
  const createContractor = (data: any) => createContractorMutation.mutateAsync(data);
  const updateContractor = (id: string, updates: Partial<Contractor>) => updateContractorMutation.mutateAsync({ id, updates });
  const deleteContractor = (id: string) => deleteContractorMutation.mutateAsync(id);

  return {
    workOrders: workOrdersQuery.data || [],
    contractors: contractorsQuery.data || [],
    loading: workOrdersQuery.isLoading || contractorsQuery.isLoading,
    error: workOrdersQuery.error || contractorsQuery.error,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    createContractor,
    updateContractor,
    deleteContractor,
    // Keep refreshData for backward compat but now it just invalidates cache
    refreshData: invalidateAll,
  };
};
