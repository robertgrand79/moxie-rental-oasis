
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface WorkOrderBasicFormProps {
  formData: {
    title: string;
    description: string;
    scope_of_work: string;
    special_instructions: string;
  };
  onFormChange: (field: string, value: string) => void;
}

const WorkOrderBasicForm = ({ formData, onFormChange }: WorkOrderBasicFormProps) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Work Order Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
          placeholder="Enter work order title..."
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          placeholder="Describe the work needed..."
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="scope_of_work">Scope of Work</Label>
        <Textarea
          id="scope_of_work"
          value={formData.scope_of_work}
          onChange={(e) => onFormChange('scope_of_work', e.target.value)}
          placeholder="Detailed scope of work..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="special_instructions">Special Instructions</Label>
        <Textarea
          id="special_instructions"
          value={formData.special_instructions}
          onChange={(e) => onFormChange('special_instructions', e.target.value)}
          placeholder="Any special instructions for the contractor..."
          rows={2}
        />
      </div>
    </>
  );
};

export default WorkOrderBasicForm;
