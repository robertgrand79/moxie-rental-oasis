
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { PropertyProject } from '@/hooks/property-management/types';

interface CreateTaskFromWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: any) => Promise<void>;
  workOrder: WorkOrder;
  projects: PropertyProject[];
}

const taskTypes = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'supply_order', label: 'Supply Order' },
  { value: 'guest_service', label: 'Guest Service' },
  { value: 'admin', label: 'Administrative' },
];

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

  // Filter projects by property if property is selected
  const filteredProjects = projects.filter(project => 
    !formData.property_id || formData.property_id === "none" || project.property_id === formData.property_id
  );

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
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Task Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Project (Optional)</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => setFormData({ ...formData, project_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project</SelectItem>
                {filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick due date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

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
