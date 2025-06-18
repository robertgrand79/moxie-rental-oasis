
import React, { useState } from 'react';
import { useWorkOrderManagement, WorkOrder } from '@/hooks/useWorkOrderManagement';
import WorkOrdersHeader from '@/components/admin/workorders/WorkOrdersHeader';
import WorkOrdersList from '@/components/admin/workorders/WorkOrdersList';
import CreateWorkOrderModal from '@/components/admin/workorders/CreateWorkOrderModal';
import LoadingState from '@/components/ui/loading-state';

const AdminWorkOrders = () => {
  const {
    workOrders,
    contractors,
    loading,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  } = useWorkOrderManagement();

  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredWorkOrders = workOrders.filter(workOrder => {
    if (statusFilter !== 'all' && workOrder.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && workOrder.priority !== priorityFilter) return false;
    return true;
  });

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setIsWorkOrderModalOpen(true);
  };

  const handleCreateWorkOrder = async (workOrderData: any) => {
    if (editingWorkOrder) {
      await updateWorkOrder(editingWorkOrder.id, workOrderData);
      setEditingWorkOrder(null);
    } else {
      await createWorkOrder(workOrderData);
    }
  };

  const handleDeleteWorkOrder = async (workOrderId: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      await deleteWorkOrder(workOrderId);
    }
  };

  const handleStatusChange = async (workOrderId: string, status: string) => {
    const updateData: any = { status };
    
    if (status === 'sent' && !workOrders.find(wo => wo.id === workOrderId)?.sent_at) {
      updateData.sent_at = new Date().toISOString();
    }
    if (status === 'acknowledged') {
      updateData.acknowledged_at = new Date().toISOString();
    }
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    await updateWorkOrder(workOrderId, updateData);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <WorkOrdersHeader
        totalWorkOrders={workOrders.length}
        pendingWorkOrders={workOrders.filter(wo => wo.status === 'draft').length}
        onCreateWorkOrder={() => {
          setEditingWorkOrder(null);
          setIsWorkOrderModalOpen(true);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
      />

      <WorkOrdersList
        workOrders={filteredWorkOrders}
        onWorkOrderClick={handleWorkOrderClick}
        onStatusChange={handleStatusChange}
        onDeleteWorkOrder={handleDeleteWorkOrder}
      />

      <CreateWorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => {
          setIsWorkOrderModalOpen(false);
          setEditingWorkOrder(null);
        }}
        onCreateWorkOrder={handleCreateWorkOrder}
        contractors={contractors}
        editingWorkOrder={editingWorkOrder}
      />
    </div>
  );
};

export default AdminWorkOrders;
