import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TaskFormData {
  title: string;
  description: string;
}

interface TaskBasicInfoFormProps {
  formData: TaskFormData;
  onFormDataChange: (data: TaskFormData) => void;
}

const TaskBasicInfoForm = ({ formData, onFormDataChange }: TaskBasicInfoFormProps) => {
  return (
    <>
      <div className="col-span-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
    </>
  );
};

export default TaskBasicInfoForm;
