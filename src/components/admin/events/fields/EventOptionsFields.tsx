
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface EventOptionsFieldsProps {
  isFeatured: boolean;
  isActive: boolean;
  isRecurring: boolean;
  recurrencePattern: string;
  onFeaturedChange: (featured: boolean) => void;
  onActiveChange: (active: boolean) => void;
  onRecurringChange: (recurring: boolean) => void;
  onRecurrencePatternChange: (pattern: string) => void;
}

const EventOptionsFields = ({
  isFeatured,
  isActive,
  isRecurring,
  recurrencePattern,
  onFeaturedChange,
  onActiveChange,
  onRecurringChange,
  onRecurrencePatternChange
}: EventOptionsFieldsProps) => {
  return (
    <>
      <div className="md:col-span-2 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_featured"
            checked={isFeatured}
            onCheckedChange={onFeaturedChange}
          />
          <Label htmlFor="is_featured">Featured Event</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={onActiveChange}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_recurring"
            checked={isRecurring}
            onCheckedChange={onRecurringChange}
          />
          <Label htmlFor="is_recurring">Recurring Event</Label>
        </div>
      </div>

      {isRecurring && (
        <div className="md:col-span-2">
          <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
          <Input
            id="recurrence_pattern"
            placeholder="e.g., Every Saturday, Monthly, etc."
            value={recurrencePattern}
            onChange={(e) => onRecurrencePatternChange(e.target.value)}
          />
        </div>
      )}
    </>
  );
};

export default EventOptionsFields;
