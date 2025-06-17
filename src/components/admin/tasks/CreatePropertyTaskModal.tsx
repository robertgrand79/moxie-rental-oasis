
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PropertyTask, PropertyProject, CustomTaskType } from '@/hooks/property-management/types';
import { Property } from '@/types/property';

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

  const defaultTaskTypes = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'repair', label: 'Repair' },
    { value: 'supply_order', label: 'Supply Order' },
    { value: 'guest_service', label: 'Guest Service' },
    { value: 'admin', label: 'Administrative' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const recurrenceFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

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
            <div className="col-span-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="property">Property (Optional)</Label>
              <Select value={formData.property_id} onValueChange={(value) => setFormData({ ...formData, property_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Property</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Project</SelectItem>
                  {projects
                    .filter(project => !formData.property_id || project.property_id === formData.property_id)
                    .map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="task_type">Task Type</Label>
              <Select 
                value={formData.task_type_id || formData.type} 
                onValueChange={(value) => {
                  const customType = taskTypes.find(t => t.id === value);
                  if (customType) {
                    setFormData({ ...formData, task_type_id: value, type: 'admin' });
                  } else {
                    setFormData({ ...formData, task_type_id: '', type: value as any });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Custom Types</div>
                      {taskTypes.map((taskType) => (
                        <SelectItem key={taskType.id} value={taskType.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: taskType.color }}
                            />
                            {taskType.name}
                          </div>
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Default Types</div>
                    </>
                  )}
                  {defaultTaskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
              />
              <Label htmlFor="is_recurring">Recurring Task</Label>
            </div>

            {formData.is_recurring && (
              <>
                <div>
                  <Label htmlFor="recurrence_frequency">Frequency</Label>
                  <Select 
                    value={formData.recurrence_frequency || ''} 
                    onValueChange={(value: any) => setFormData({ ...formData, recurrence_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurrenceFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recurrence_interval">Interval</Label>
                  <Input
                    id="recurrence_interval"
                    type="number"
                    min="1"
                    value={formData.recurrence_interval}
                    onChange={(e) => setFormData({ ...formData, recurrence_interval: parseInt(e.target.value) || 1 })}
                    placeholder="e.g., 2 for every 2 weeks"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="recurrence_end_date">End Date (Optional)</Label>
                  <Input
                    id="recurrence_end_date"
                    type="date"
                    value={formData.recurrence_end_date}
                    onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
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
