
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RecurrenceFormData {
  is_recurring: boolean;
  recurrence_frequency: string | undefined;
  recurrence_interval: number;
  recurrence_end_date: string;
}

interface TaskRecurrenceFormProps {
  formData: RecurrenceFormData;
  onFormDataChange: (data: RecurrenceFormData) => void;
}

const TaskRecurrenceForm = ({ formData, onFormDataChange }: TaskRecurrenceFormProps) => {
  const recurrenceFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <>
      <div className="col-span-2 flex items-center space-x-2">
        <Switch
          id="is_recurring"
          checked={formData.is_recurring}
          onCheckedChange={(checked) => onFormDataChange({ ...formData, is_recurring: checked })}
        />
        <Label htmlFor="is_recurring">Recurring Task</Label>
      </div>

      {formData.is_recurring && (
        <>
          <div>
            <Label htmlFor="recurrence_frequency">Frequency</Label>
            <Select 
              value={formData.recurrence_frequency || ''} 
              onValueChange={(value: string) => onFormDataChange({ ...formData, recurrence_frequency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceFrequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recurrence_interval">Interval</Label>
            <Input
              id="recurrence_interval"
              type="number"
              min="1"
              value={formData.recurrence_interval}
              onChange={(e) => onFormDataChange({ ...formData, recurrence_interval: parseInt(e.target.value) || 1 })}
              placeholder="e.g., 2 for every 2 weeks"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="recurrence_end_date">End Date (Optional)</Label>
            <Input
              id="recurrence_end_date"
              type="date"
              value={formData.recurrence_end_date}
              onChange={(e) => onFormDataChange({ ...formData, recurrence_end_date: e.target.value })}
            />
          </div>
        </>
      )}
    </>
  );
};

export default TaskRecurrenceForm;
