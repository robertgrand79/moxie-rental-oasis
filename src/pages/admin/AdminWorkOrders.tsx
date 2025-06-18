
import React, { useState } from 'react';
import { useWorkOrderManagement, WorkOrder } from '@/hooks/useWorkOrderManagement';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { useWorkOrderRelationships } from '@/hooks/useWorkOrderRelationships';
import WorkOrdersHeader from '@/components/admin/workorders/WorkOrdersHeader';
import WorkOrdersList from '@/components/admin/workorders/WorkOrdersList';
import CreateWorkOrderModal from '@/components/admin/workorders/CreateWorkOrderModal';
import CreateProjectFromWorkOrderModal from '@/components/admin/workorders/CreateProjectFromWorkOrderModal';
import CreateTaskFromWorkOrderModal from '@/components/admin/workorders/CreateTaskFromWorkOrderModal';
import WorkOrderRelationshipCard from '@/components/admin/workorders/WorkOrderRelationshipCard';
import LoadingState from '@/components/ui/loading-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AdminWorkOrders = () => {
  const {
    workOrders,
    contractors,
    loading,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  } = useWorkOrderManagement();

  const { projects, createProject, createTask } = usePropertyManagement();
  
  const {
    createProjectFromWorkOrder,
    createTaskFromWorkOrder,
    linkWorkOrderToProject,
  } = useWorkOrderRelationships();

  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedWorkOrderForRelationship, setSelectedWorkOrderForRelationship] = useState<WorkOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredWorkOrders = workOrders.filter(workOrder => {
    if (statusFilter !== 'all' && workOrder.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && workOrder.priority !== priorityFilter) return false;
    return true;
  });

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setSelectedWorkOrderForRelationship(workOrder);
    setIsRelationshipModalOpen(true);
  };

  const handleCreateWorkOrder = async (workOrderData: any) => {
    if (editingWorkOrder) {
      await updateWorkOrder(editingWorkOrder.id, workOrderData);
      setEditingWorkOrder(null);
    } else {
      await createWorkOrder(workOrderData);
    }
  };

  const handleCreateProjectFromWorkOrder = async (projectData: any) => {
    if (selectedWorkOrderForRelationship) {
      await createProjectFromWorkOrder(selectedWorkOrderForRelationship.id, projectData);
      setIsProjectModalOpen(false);
      setIsRelationshipModalOpen(false);
    }
  };

  const handleCreateTaskFromWorkOrder = async (taskData: any) => {
    if (selectedWorkOrderForRelationship) {
      await createTaskFromWorkOrder(selectedWorkOrderForRelationship.id, taskData);
      setIsTaskModalOpen(false);
      setIsRelationshipModalOpen(false);
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

      <CreateProjectFromWorkOrderModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProjectFromWorkOrder}
        workOrder={selectedWorkOrderForRelationship!}
      />

      <CreateTaskFromWorkOrderModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleCreateTaskFromWorkOrder}
        workOrder={selectedWorkOrderForRelationship!}
        projects={projects}
      />

      {/* Relationship Management Modal */}
      <Dialog open={isRelationshipModalOpen} onOpenChange={setIsRelationshipModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Work Order: {selectedWorkOrderForRelationship?.work_order_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkOrderForRelationship && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Work Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {selectedWorkOrderForRelationship.title}</div>
                  <div><strong>Status:</strong> {selectedWorkOrderForRelationship.status}</div>
                  <div><strong>Priority:</strong> {selectedWorkOrderForRelationship.priority}</div>
                  <div><strong>Description:</strong> {selectedWorkOrderForRelationship.description}</div>
                </div>
              </div>
              
              <WorkOrderRelationshipCard
                workOrder={selectedWorkOrderForRelationship}
                onCreateProject={() => setIsProjectModalOpen(true)}
                onCreateTask={() => setIsTaskModalOpen(true)}
                onLinkToProject={() => {
                  // TODO: Implement project linking modal
                  console.log('Link to project');
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWorkOrders;
