
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskDetailsFormProps {
  formData: {
    priority: string;
    status: string;
    due_date: string;
    estimated_hours: number;
  };
  onFormDataChange: (data: any) => void;
}

const TaskDetailsForm = ({ formData, onFormDataChange }: TaskDetailsFormProps) => {
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

  return (
    <>
      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value: any) => onFormDataChange({ ...formData, priority: value })}>
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
        <Select value={formData.status} onValueChange={(value: any) => onFormDataChange({ ...formData, status: value })}>
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
          onChange={(e) => onFormDataChange({ ...formData, due_date: e.target.value })}
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
          onChange={(e) => onFormDataChange({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
        />
      </div>
    </>
  );
};

export default TaskDetailsForm;
