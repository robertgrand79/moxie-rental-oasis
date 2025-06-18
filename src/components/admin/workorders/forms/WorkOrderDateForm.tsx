
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface WorkOrderDateFormProps {
  estimatedCompletionDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const WorkOrderDateForm = ({ estimatedCompletionDate, onDateChange }: WorkOrderDateFormProps) => {
  return (
    <div>
      <Label>Estimated Completion Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {estimatedCompletionDate ? format(estimatedCompletionDate, 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={estimatedCompletionDate}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WorkOrderDateForm;
