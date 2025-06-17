
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PropertyTask, PropertyProject, CustomTaskType } from '@/hooks/property-management/types';
import { Property } from '@/types/property';
import TaskBasicInfoForm from './forms/TaskBasicInfoForm';
import TaskSelectionForm from './forms/TaskSelectionForm';
import TaskTypeForm from './forms/TaskTypeForm';
import TaskDetailsForm from './forms/TaskDetailsForm';
import TaskRecurrenceForm from './forms/TaskRecurrenceForm';
import TaskNotesForm from './forms/TaskNotesForm';

interface CreatePropertyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: Omit<PropertyTask, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'project' | 'task_type' | 'assignments'>) => Promise<void>;
  properties: Property[];
  projects: PropertyProject[];
  taskTypes: CustomTaskType[];
  editingTask?: PropertyTask | null;
}

const CreatePropertyTaskModal = ({
  isOpen,
  onClose,
  onCreateTask,
  properties,
  projects,
  taskTypes,
  editingTask,
}: CreatePropertyTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    property_id: editingTask?.property_id || '',
    project_id: editingTask?.project_id || '',
    type: editingTask?.type || 'admin' as const,
    status: editingTask?.status || 'pending' as const,
    priority: editingTask?.priority || 'medium' as const,
    due_date: editingTask?.due_date || '',
    estimated_hours: editingTask?.estimated_hours || 0,
    is_recurring: editingTask?.is_recurring || false,
    recurrence_frequency: editingTask?.recurrence_frequency || undefined,
    recurrence_interval: editingTask?.recurrence_interval || 1,
    recurrence_end_date: editingTask?.recurrence_end_date || '',
    task_type_id: editingTask?.task_type_id || '',
    notes: editingTask?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onCreateTask({
        ...formData,
        property_id: formData.property_id || undefined,
        project_id: formData.project_id || undefined,
        task_type_id: formData.task_type_id || undefined,
        estimated_hours: formData.estimated_hours || undefined,
        due_date: formData.due_date || undefined,
        recurrence_frequency: formData.is_recurring ? formData.recurrence_frequency : undefined,
        recurrence_interval: formData.is_recurring ? formData.recurrence_interval : undefined,
        recurrence_end_date: formData.is_recurring && formData.recurrence_end_date ? formData.recurrence_end_date : undefined,
        checklist_items: undefined,
        photos: undefined,
        assigned_to: undefined,
        actual_hours: undefined,
        recurrence_pattern: undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TaskBasicInfoForm formData={formData} onFormDataChange={setFormData} />
            <TaskSelectionForm 
              formData={formData} 
              properties={properties} 
              projects={projects} 
              onFormDataChange={setFormData} 
            />
            <TaskTypeForm 
              formData={formData} 
              taskTypes={taskTypes} 
              onFormDataChange={setFormData} 
            />
            <TaskDetailsForm formData={formData} onFormDataChange={setFormData} />
            <TaskRecurrenceForm formData={formData} onFormDataChange={setFormData} />
            <TaskNotesForm formData={formData} onFormDataChange={setFormData} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePropertyTaskModal;
