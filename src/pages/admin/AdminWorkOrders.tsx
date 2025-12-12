
import React, { useState, useCallback } from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useWorkOrderOperations } from '@/hooks/useWorkOrderOperations';
import { useWorkOrderFilters } from '@/hooks/useWorkOrderFilters';
import { useWorkOrderStats } from '@/hooks/useWorkOrderStats';
import ModernWorkOrdersHeader from '@/components/admin/workorders/ModernWorkOrdersHeader';
import WorkOrdersGrid from '@/components/admin/workorders/WorkOrdersGrid';
import WorkOrdersTable from '@/components/admin/workorders/WorkOrdersTable';
import WorkOrderSidePanel from '@/components/admin/workorders/WorkOrderSidePanel';
import LoadingState from '@/components/ui/loading-state';

import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminWorkOrders = () => {
  const {
    workOrders,
    contractors,
    loading,
    emailingWorkOrders,
    updatingWorkOrders,
    handleSaveWorkOrder,
    handleDeleteWorkOrder,
    handleStatusChange,
    handleEmailWorkOrder,
    refreshData,
  } = useWorkOrderOperations();

  const {
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    filteredWorkOrders,
  } = useWorkOrderFilters(workOrders);

  const { totalWorkOrders, pendingWorkOrders, inProgressWorkOrders, completedWorkOrders } = useWorkOrderStats(workOrders);

  // UI State
  const [isWorkOrderPanelOpen, setIsWorkOrderPanelOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleCreateWorkOrder = () => {
    // Ensure we clear any existing editing state
    setEditingWorkOrder(null);
    setIsWorkOrderPanelOpen(true);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setIsWorkOrderPanelOpen(true);
  };

  const handleSaveAndClose = async (workOrderData: any) => {
    try {
      await handleSaveWorkOrder(workOrderData, editingWorkOrder);
      // Close the modal and reset state after successful save
      setIsWorkOrderPanelOpen(false);
      setEditingWorkOrder(null);
    } catch (error) {
      // Don't close the modal if there was an error
      // The error will be shown via toast in handleSaveWorkOrder
      console.error('Failed to save work order, keeping modal open:', error);
    }
  };

  const handleClosePanel = () => {
    setIsWorkOrderPanelOpen(false);
    setEditingWorkOrder(null);
  };

  // State reset handler for sidebar navigation
  const resetToDefaultState = useCallback(() => {
    setIsWorkOrderPanelOpen(false);
    setEditingWorkOrder(null);
    setViewMode('grid');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  }, [setStatusFilter, setPriorityFilter, setSearchQuery]);

  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ onReset: resetToDefaultState });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <ModernWorkOrdersHeader
        totalWorkOrders={totalWorkOrders}
        pendingWorkOrders={pendingWorkOrders}
        inProgressWorkOrders={inProgressWorkOrders}
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
        workOrders={filteredWorkOrders}
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
        onClose={handleClosePanel}
        workOrder={editingWorkOrder}
        contractors={contractors}
        onSave={handleSaveAndClose}
        isEditing={!!editingWorkOrder}
      />
    </div>
  );
};

export default AdminWorkOrders;
