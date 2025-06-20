
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormData {
  description: string;
  scope_of_work: string;
  special_instructions: string;
}

interface WorkOrderDetailsFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const WorkOrderDetailsFields = ({ formData, setFormData }: WorkOrderDetailsFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="What work needs to be done?"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope_of_work">Scope of Work</Label>
        <Textarea
          id="scope_of_work"
          value={formData.scope_of_work}
          onChange={(e) => setFormData(prev => ({ ...prev, scope_of_work: e.target.value }))}
          placeholder="Detailed scope and requirements"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="special_instructions">Special Instructions</Label>
        <Textarea
          id="special_instructions"
          value={formData.special_instructions}
          onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
          placeholder="Any special notes or requirements"
          rows={2}
        />
      </div>
    </div>
  );
};

export default WorkOrderDetailsFields;
