
import React, { useState, useCallback } from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useWorkOrderOperations } from '@/hooks/useWorkOrderOperations';
import { useWorkOrderFilters } from '@/hooks/useWorkOrderFilters';
import { useWorkOrderStats } from '@/hooks/useWorkOrderStats';
import { useWorkOrderBulkEmail } from '@/hooks/useWorkOrderBulkEmail';
import ModernWorkOrdersHeader from '@/components/admin/workorders/ModernWorkOrdersHeader';
import WorkOrdersGrid from '@/components/admin/workorders/WorkOrdersGrid';
import WorkOrdersTable from '@/components/admin/workorders/WorkOrdersTable';
import WorkOrderSidePanel from '@/components/admin/workorders/WorkOrderSidePanel';
import SelectionActionBar from '@/components/admin/workorders/SelectionActionBar';
import ContractorSelectModal from '@/components/admin/workorders/ContractorSelectModal';
import LoadingState from '@/components/ui/loading-state';
import { SendMethod } from '@/hooks/useWorkOrderEmail';

import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminWorkOrders = () => {
  const {
    workOrders,
    contractors,
    loading,
    emailingWorkOrders,
    textingWorkOrders,
    updatingWorkOrders,
    handleSaveWorkOrder,
    handleDeleteWorkOrder,
    handleStatusChange,
    handleSendWorkOrder,
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
  
  const { isSending, sendBulkWorkOrders } = useWorkOrderBulkEmail();

  // UI State
  const [isWorkOrderPanelOpen, setIsWorkOrderPanelOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Selection state
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<Set<string>>(new Set());
  const [isContractorModalOpen, setIsContractorModalOpen] = useState(false);

  const handleSelectWorkOrder = useCallback((workOrderId: string, selected: boolean) => {
    setSelectedWorkOrders(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(workOrderId);
      } else {
        newSet.delete(workOrderId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedWorkOrders.size === filteredWorkOrders.length) {
      setSelectedWorkOrders(new Set());
    } else {
      setSelectedWorkOrders(new Set(filteredWorkOrders.map(wo => wo.id)));
    }
  }, [filteredWorkOrders, selectedWorkOrders.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedWorkOrders(new Set());
  }, []);

  const handleSendToContractor = useCallback(() => {
    setIsContractorModalOpen(true);
  }, []);

  const handleContractorSelect = useCallback(async (contractorId: string) => {
    const workOrderIds = Array.from(selectedWorkOrders);
    const success = await sendBulkWorkOrders(workOrderIds, contractorId);
    
    if (success) {
      setIsContractorModalOpen(false);
      setSelectedWorkOrders(new Set());
      refreshData();
    }
  }, [selectedWorkOrders, sendBulkWorkOrders, refreshData]);

  const handleCreateWorkOrder = () => {
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
      setIsWorkOrderPanelOpen(false);
      setEditingWorkOrder(null);
    } catch (error) {
      console.error('Failed to save work order, keeping modal open:', error);
    }
  };

  const handleClosePanel = () => {
    setIsWorkOrderPanelOpen(false);
    setEditingWorkOrder(null);
  };

  // Wrapper to handle sending with method
  const onSendWorkOrder = useCallback((workOrder: WorkOrder, method: SendMethod) => {
    handleSendWorkOrder(workOrder, method);
  }, [handleSendWorkOrder]);

  // State reset handler for sidebar navigation
  const resetToDefaultState = useCallback(() => {
    setIsWorkOrderPanelOpen(false);
    setEditingWorkOrder(null);
    setViewMode('grid');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    setSelectedWorkOrders(new Set());
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
          onSendWorkOrder={onSendWorkOrder}
          onStatusChange={handleStatusChange}
          emailingWorkOrders={emailingWorkOrders}
          textingWorkOrders={textingWorkOrders}
          updatingWorkOrders={updatingWorkOrders}
          selectedWorkOrders={selectedWorkOrders}
          onSelectWorkOrder={handleSelectWorkOrder}
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
            textingWorkOrders={textingWorkOrders}
            onSendWorkOrder={onSendWorkOrder}
            updatingWorkOrders={updatingWorkOrders}
            selectedWorkOrders={selectedWorkOrders}
            onSelectWorkOrder={handleSelectWorkOrder}
            onSelectAll={handleSelectAll}
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

      <SelectionActionBar
        selectedCount={selectedWorkOrders.size}
        onSendToContractor={handleSendToContractor}
        onClearSelection={handleClearSelection}
        isSending={isSending}
      />

      <ContractorSelectModal
        isOpen={isContractorModalOpen}
        onClose={() => setIsContractorModalOpen(false)}
        onSelect={handleContractorSelect}
        contractors={contractors}
        selectedWorkOrderCount={selectedWorkOrders.size}
        isSending={isSending}
      />
    </div>
  );
};

export default AdminWorkOrders;
