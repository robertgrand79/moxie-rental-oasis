
import { useState, useEffect } from 'react';
import { useContractorManagement } from './workorder-management/useContractorManagement';
import { useWorkOrderOperations } from './workorder-management/useWorkOrderOperations';

// Re-export types for backward compatibility
export type { Contractor } from './workorder-management/useContractorManagement';
export type { WorkOrder } from './workorder-management/useWorkOrderOperations';

export const useWorkOrderManagement = () => {
  const [loading, setLoading] = useState(true);
  
  const {
    contractors,
    fetchContractors,
    createContractor,
    updateContractor,
    deleteContractor,
  } = useContractorManagement();

  const {
    workOrders,
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  } = useWorkOrderOperations();

  const refreshData = async () => {
    await Promise.all([fetchContractors(), fetchWorkOrders()]);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    workOrders,
    contractors,
    loading,
    createContractor,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    updateContractor,
    deleteContractor,
    refreshData,
  };
};
