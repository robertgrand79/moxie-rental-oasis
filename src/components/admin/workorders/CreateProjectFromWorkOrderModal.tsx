
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
import ProjectBasicInfoForm from './forms/ProjectBasicInfoForm';
import ProjectTypeSelectionForm from './forms/ProjectTypeSelectionForm';
import ProjectDateSelectionForm from './forms/ProjectDateSelectionForm';

interface CreateProjectFromWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: any) => Promise<void>;
  workOrder: WorkOrder | null;
}

const CreateProjectFromWorkOrderModal = ({
  isOpen,
  onClose,
  onCreateProject,
  workOrder,
}: CreateProjectFromWorkOrderModalProps) => {
  const [formData, setFormData] = useState({
    title: workOrder ? `Project: ${workOrder.title}` : '',
    description: workOrder ? `Project created from work order: ${workOrder.work_order_number}\n\n${workOrder.description}` : '',
    type: 'maintenance',
    status: 'planning',
    priority: workOrder?.priority || 'medium',
    property_id: workOrder?.property_id || '',
  });

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    workOrder?.estimated_completion_date ? new Date(workOrder.estimated_completion_date) : undefined
  );
  const [loading, setLoading] = useState(false);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrder) return;
    
    setLoading(true);

    try {
      await onCreateProject({
        ...formData,
        property_id: formData.property_id || undefined,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        target_completion_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : undefined,
        work_order_id: workOrder.id,
      });

      onClose();
    } catch (error) {
      console.error('Error creating project from work order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!workOrder) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Project from Work Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ProjectBasicInfoForm 
            formData={formData}
            onFormChange={handleFormChange}
          />

          <ProjectTypeSelectionForm
            formData={formData}
            onFormChange={handleFormChange}
          />

          <ProjectDateSelectionForm
            startDate={startDate}
            targetDate={targetDate}
            onStartDateChange={setStartDate}
            onTargetDateChange={setTargetDate}
          />

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectFromWorkOrderModal;
