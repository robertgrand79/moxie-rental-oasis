
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TaskBasicInfoFormProps {
  formData: {
    title: string;
    description: string;
  };
  onFormChange: (field: string, value: string) => void;
}

const TaskBasicInfoForm = ({ formData, onFormChange }: TaskBasicInfoFormProps) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          rows={4}
        />
      </div>
    </>
  );
};

export default TaskBasicInfoForm;
