
import React, { useState } from 'react';
import { useWorkOrderManagement, WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useWorkOrderEmail } from '@/hooks/useWorkOrderEmail';
import { useToast } from '@/hooks/use-toast';
import ModernWorkOrdersHeader from '@/components/admin/workorders/ModernWorkOrdersHeader';
import WorkOrdersGrid from '@/components/admin/workorders/WorkOrdersGrid';
import WorkOrdersTable from '@/components/admin/workorders/WorkOrdersTable';
import WorkOrderSidePanel from '@/components/admin/workorders/WorkOrderSidePanel';
import LoadingState from '@/components/ui/loading-state';

const AdminWorkOrders = () => {
  const {
    workOrders,
    contractors,
    loading,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    refreshData,
  } = useWorkOrderManagement();

  const { emailingWorkOrders, handleEmailWorkOrder } = useWorkOrderEmail();
  const { toast } = useToast();

  // UI State
  const [isWorkOrderPanelOpen, setIsWorkOrderPanelOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [updatingWorkOrders, setUpdatingWorkOrders] = useState<Set<string>>(new Set());

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(workOrder => {
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

  // Calculate stats
  const totalWorkOrders = workOrders.length;
  const pendingWorkOrders = workOrders.filter(wo => wo.status === 'draft').length;
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed' || wo.status === 'paid').length;

  const handleCreateWorkOrder = () => {
    setEditingWorkOrder(null);
    setIsWorkOrderPanelOpen(true);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setIsWorkOrderPanelOpen(true);
  };

  const handleSaveWorkOrder = async (workOrderData: any) => {
    try {
      if (editingWorkOrder) {
        await updateWorkOrder(editingWorkOrder.id, workOrderData);
        toast({
          title: 'Success',
          description: 'Work order updated successfully',
        });
      } else {
        await createWorkOrder(workOrderData);
        toast({
          title: 'Success',
          description: 'Work order created successfully',
        });
      }
      setIsWorkOrderPanelOpen(false);
      setEditingWorkOrder(null);
    } catch (error) {
      console.error('Error saving work order:', error);
    }
  };

  const handleDeleteWorkOrder = async (workOrderId: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      await deleteWorkOrder(workOrderId);
    }
  };

  const handleEmailWorkOrder = async (workOrder: WorkOrder) => {
    await handleEmailWorkOrder(workOrder, handleStatusChange);
  };

  const handleStatusChange = async (workOrderId: string, status: string) => {
    if (updatingWorkOrders.has(workOrderId)) return;

    setUpdatingWorkOrders(prev => new Set([...prev, workOrderId]));

    try {
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
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingWorkOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(workOrderId);
        return newSet;
      });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <ModernWorkOrdersHeader
        totalWorkOrders={totalWorkOrders}
        pendingWorkOrders={pendingWorkOrders}
        completedWorkOrders={completedWorkOrders}
        onCreateWorkOrder={handleCreateWorkOrder}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refreshData}
      />

      {viewMode === 'grid' ? (
        <WorkOrdersGrid
          workOrders={filteredWorkOrders}
          onWorkOrderEdit={handleEditWorkOrder}
          onDeleteWorkOrder={handleDeleteWorkOrder}
          onEmailWorkOrder={handleEmailWorkOrder}
          onStatusChange={handleStatusChange}
          emailingWorkOrders={emailingWorkOrders}
          updatingWorkOrders={updatingWorkOrders}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm">
          <WorkOrdersTable
            workOrders={filteredWorkOrders}
            onWorkOrderClick={handleEditWorkOrder}
            onStatusChange={handleStatusChange}
            onPriorityChange={handleStatusChange}
            onDeleteWorkOrder={handleDeleteWorkOrder}
            emailingWorkOrders={emailingWorkOrders}
            onEmailWorkOrder={handleEmailWorkOrder}
            updatingWorkOrders={updatingWorkOrders}
          />
        </div>
      )}

      <WorkOrderSidePanel
        isOpen={isWorkOrderPanelOpen}
        onClose={() => {
          setIsWorkOrderPanelOpen(false);
          setEditingWorkOrder(null);
        }}
        workOrder={editingWorkOrder}
        contractors={contractors}
        onSave={handleSaveWorkOrder}
        isEditing={!!editingWorkOrder}
      />
    </div>
  );
};

export default AdminWorkOrders;
