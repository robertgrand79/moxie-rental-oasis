
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomTaskType } from '@/hooks/property-management/types';

interface TaskTypeFormProps {
  formData: {
    task_type_id: string;
    type: string;
  };
  taskTypes: CustomTaskType[];
  onFormDataChange: (data: any) => void;
}

const TaskTypeForm = ({ formData, taskTypes, onFormDataChange }: TaskTypeFormProps) => {
  const defaultTaskTypes = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'repair', label: 'Repair' },
    { value: 'supply_order', label: 'Supply Order' },
    { value: 'guest_service', label: 'Guest Service' },
    { value: 'admin', label: 'Administrative' },
  ];

  return (
    <div>
      <Label htmlFor="task_type">Task Type</Label>
      <Select 
        value={formData.task_type_id || formData.type} 
        onValueChange={(value) => {
          const customType = taskTypes.find(t => t.id === value);
          if (customType) {
            onFormDataChange({ ...formData, task_type_id: value, type: 'admin' });
          } else {
            onFormDataChange({ ...formData, task_type_id: '', type: value as any });
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
  );
};

export default TaskTypeForm;
