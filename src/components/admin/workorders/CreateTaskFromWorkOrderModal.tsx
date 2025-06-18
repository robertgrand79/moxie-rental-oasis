
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { PropertyProject } from '@/hooks/property-management/types';
import TaskBasicInfoForm from './forms/TaskBasicInfoForm';
import TaskTypeAndPriorityForm from './forms/TaskTypeAndPriorityForm';
import TaskProjectAndDateForm from './forms/TaskProjectAndDateForm';

interface CreateTaskFromWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: any) => Promise<void>;
  workOrder: WorkOrder;
  projects: PropertyProject[];
}

const CreateTaskFromWorkOrderModal = ({
  isOpen,
  onClose,
  onCreateTask,
  workOrder,
  projects,
}: CreateTaskFromWorkOrderModalProps) => {
  const [formData, setFormData] = useState({
    title: `Follow-up: ${workOrder.title}`,
    description: `Task created from work order: ${workOrder.work_order_number}\n\nOriginal description: ${workOrder.description}`,
    type: 'maintenance',
    status: 'pending',
    priority: workOrder.priority,
    property_id: workOrder.property_id || '',
    project_id: workOrder.project_id || 'none',
  });

  const [dueDate, setDueDate] = useState<Date | undefined>(
    workOrder.estimated_completion_date ? new Date(workOrder.estimated_completion_date) : undefined
  );
  const [loading, setLoading] = useState(false);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateTask({
        ...formData,
        property_id: formData.property_id || undefined,
        project_id: formData.project_id === 'none' ? undefined : formData.project_id,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        work_order_id: workOrder.id, // Pass this to link them
      });

      onClose();
    } catch (error) {
      console.error('Error creating task from work order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Follow-up Task from Work Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TaskBasicInfoForm 
            formData={formData}
            onFormChange={handleFormChange}
          />

          <TaskTypeAndPriorityForm
            formData={formData}
            onFormChange={handleFormChange}
          />

          <TaskProjectAndDateForm
            formData={formData}
            projects={projects}
            dueDate={dueDate}
            onFormChange={handleFormChange}
            onDueDateChange={setDueDate}
          />

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskFromWorkOrderModal;
