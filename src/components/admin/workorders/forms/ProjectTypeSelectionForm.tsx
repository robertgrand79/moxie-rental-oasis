
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectTypeSelectionFormProps {
  formData: {
    type: string;
    priority: string;
  };
  onFormChange: (field: string, value: string) => void;
}

const projectTypes = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'turnover', label: 'Turnover' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'improvement', label: 'Improvement' },
];

const ProjectTypeSelectionForm = ({ formData, onFormChange }: ProjectTypeSelectionFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Project Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => onFormChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectTypes.map((type) => (
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
          onValueChange={(value) => onFormChange('priority', value)}
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
  );
};

export default ProjectTypeSelectionForm;
