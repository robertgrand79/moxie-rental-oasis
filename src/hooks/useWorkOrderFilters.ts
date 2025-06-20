
import { useState, useMemo } from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

export const useWorkOrderFilters = (workOrders: WorkOrder[]) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(workOrder => {
      if (statusFilter !== 'all' && workOrder.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && workOrder.priority !== priorityFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          workOrder.title.toLowerCase().includes(query) ||
          workOrder.description.toLowerCase().includes(query) ||
          workOrder.work_order_number.toLowerCase().includes(query) ||
          workOrder.contractor?.name.toLowerCase().includes(query) ||
          workOrder.property?.title.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [workOrders, statusFilter, priorityFilter, searchQuery]);

  return {
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    filteredWorkOrders,
  };
};
