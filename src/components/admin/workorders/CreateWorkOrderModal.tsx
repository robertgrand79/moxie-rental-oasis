
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Contractor, WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useProperties } from '@/hooks/useProperties';
import WorkOrderBasicForm from './forms/WorkOrderBasicForm';
import WorkOrderSelectionForm from './forms/WorkOrderSelectionForm';
import WorkOrderDateForm from './forms/WorkOrderDateForm';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkOrder: (workOrderData: any) => Promise<void>;
  contractors: Contractor[];
  editingWorkOrder?: WorkOrder | null;
}

const CreateWorkOrderModal = ({ 
  isOpen, 
  onClose, 
  onCreateWorkOrder, 
  contractors, 
  editingWorkOrder 
}: CreateWorkOrderModalProps) => {
  const { properties } = useProperties();
  
  const [formData, setFormData] = useState({
    title: editingWorkOrder?.title || '',
    description: editingWorkOrder?.description || '',
    scope_of_work: editingWorkOrder?.scope_of_work || '',
    status: editingWorkOrder?.status || 'draft',
    priority: editingWorkOrder?.priority || 'medium',
    contractor_id: editingWorkOrder?.contractor_id || 'none',
    property_id: editingWorkOrder?.property_id || 'none',
    special_instructions: editingWorkOrder?.special_instructions || '',
  });
  
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<Date | undefined>(
    editingWorkOrder?.estimated_completion_date ? new Date(editingWorkOrder.estimated_completion_date) : undefined
  );
  
  const [loading, setLoading] = useState(false);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateWorkOrder({
        ...formData,
        contractor_id: formData.contractor_id === 'none' ? undefined : formData.contractor_id,
        property_id: formData.property_id === 'none' ? undefined : formData.property_id,
        estimated_completion_date: estimatedCompletionDate ? format(estimatedCompletionDate, 'yyyy-MM-dd') : undefined,
      });
      
      setFormData({
        title: '',
        description: '',
        scope_of_work: '',
        status: 'draft',
        priority: 'medium',
        contractor_id: 'none',
        property_id: 'none',
        special_instructions: '',
      });
      setEstimatedCompletionDate(undefined);
      onClose();
    } catch (error) {
      console.error('Error creating work order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingWorkOrder ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <WorkOrderBasicForm 
            formData={formData}
            onFormChange={handleFormChange}
          />

          <WorkOrderSelectionForm
            formData={formData}
            contractors={contractors}
            properties={properties}
            onFormChange={handleFormChange}
          />

          <WorkOrderDateForm
            estimatedCompletionDate={estimatedCompletionDate}
            onDateChange={setEstimatedCompletionDate}
          />

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : editingWorkOrder ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkOrderModal;
