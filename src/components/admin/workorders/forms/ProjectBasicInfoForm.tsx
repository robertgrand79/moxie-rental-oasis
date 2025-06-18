
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProjectBasicInfoFormProps {
  formData: {
    title: string;
    description: string;
  };
  onFormChange: (field: string, value: string) => void;
}

const ProjectBasicInfoForm = ({ formData, onFormChange }: ProjectBasicInfoFormProps) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Project Title</Label>
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

export default ProjectBasicInfoForm;
