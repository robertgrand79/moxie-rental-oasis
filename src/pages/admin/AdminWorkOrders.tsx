
import React, { useState } from 'react';
import { useWorkOrderManagement, WorkOrder, Contractor } from '@/hooks/useWorkOrderManagement';
import WorkOrdersHeader from '@/components/admin/workorders/WorkOrdersHeader';
import WorkOrdersList from '@/components/admin/workorders/WorkOrdersList';
import CreateWorkOrderModal from '@/components/admin/workorders/CreateWorkOrderModal';
import CreateContractorModal from '@/components/admin/workorders/CreateContractorModal';
import ContractorsTable from '@/components/admin/workorders/ContractorsTable';
import EditContractorModal from '@/components/admin/workorders/EditContractorModal';
import LoadingState from '@/components/ui/loading-state';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const AdminWorkOrders = () => {
  const {
    workOrders,
    contractors,
    loading,
    createContractor,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    updateContractor,
    deleteContractor,
  } = useWorkOrderManagement();

  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isContractorModalOpen, setIsContractorModalOpen] = useState(false);
  const [isEditContractorModalOpen, setIsEditContractorModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
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

  const handleCreateContractor = async (contractorData: any) => {
    await createContractor(contractorData);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setIsEditContractorModalOpen(true);
  };

  const handleUpdateContractor = async (contractorId: string, contractorData: any) => {
    await updateContractor(contractorId, contractorData);
  };

  const handleDeleteWorkOrder = async (workOrderId: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      await deleteWorkOrder(workOrderId);
    }
  };

  const handleDeleteContractor = async (contractorId: string) => {
    await deleteContractor(contractorId);
  };

  const handleToggleContractorStatus = async (contractorId: string, isActive: boolean) => {
    await updateContractor(contractorId, { is_active: isActive });
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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <WorkOrdersHeader
        totalWorkOrders={workOrders.length}
        pendingWorkOrders={workOrders.filter(wo => wo.status === 'draft').length}
        onCreateWorkOrder={() => {
          setEditingWorkOrder(null);
          setIsWorkOrderModalOpen(true);
        }}
        onCreateContractor={() => setIsContractorModalOpen(true)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
      />

      <ResizablePanelGroup direction="vertical" className="flex-1 border rounded-lg">
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="p-6 h-full overflow-auto">
            <WorkOrdersList
              workOrders={filteredWorkOrders}
              onWorkOrderClick={handleWorkOrderClick}
              onStatusChange={handleStatusChange}
              onDeleteWorkOrder={handleDeleteWorkOrder}
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={40} minSize={20}>
          <div className="p-6 h-full overflow-auto">
            <ContractorsTable
              contractors={contractors}
              onEditContractor={handleEditContractor}
              onDeleteContractor={handleDeleteContractor}
              onToggleStatus={handleToggleContractorStatus}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

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

      <CreateContractorModal
        isOpen={isContractorModalOpen}
        onClose={() => setIsContractorModalOpen(false)}
        onCreateContractor={handleCreateContractor}
      />

      <EditContractorModal
        isOpen={isEditContractorModalOpen}
        onClose={() => {
          setIsEditContractorModalOpen(false);
          setEditingContractor(null);
        }}
        onUpdateContractor={handleUpdateContractor}
        contractor={editingContractor}
      />
    </div>
  );
};

export default AdminWorkOrders;
