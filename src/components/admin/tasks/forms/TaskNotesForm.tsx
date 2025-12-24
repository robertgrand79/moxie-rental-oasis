
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TaskNotesFormData {
  notes: string;
}

interface TaskNotesFormProps {
  formData: TaskNotesFormData;
  onFormDataChange: (data: TaskNotesFormData) => void;
}

const TaskNotesForm = ({ formData, onFormDataChange }: TaskNotesFormProps) => {
  return (
    <div className="col-span-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={formData.notes}
        onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value })}
        rows={2}
      />
    </div>
  );
};

export default TaskNotesForm;
