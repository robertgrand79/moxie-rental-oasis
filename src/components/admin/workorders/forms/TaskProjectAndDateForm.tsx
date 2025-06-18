
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { PropertyProject } from '@/hooks/property-management/types';

interface TaskProjectAndDateFormProps {
  formData: {
    property_id: string;
    project_id: string;
  };
  projects: PropertyProject[];
  dueDate: Date | undefined;
  onFormChange: (field: string, value: string) => void;
  onDueDateChange: (date: Date | undefined) => void;
}

const TaskProjectAndDateForm = ({
  formData,
  projects,
  dueDate,
  onFormChange,
  onDueDateChange,
}: TaskProjectAndDateFormProps) => {
  // Filter projects by property if property is selected
  const filteredProjects = projects.filter(project => 
    !formData.property_id || formData.property_id === "none" || project.property_id === formData.property_id
  );

  return (
    <>
      <div>
        <Label>Project (Optional)</Label>
        <Select
          value={formData.project_id}
          onValueChange={(value) => onFormChange('project_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Project</SelectItem>
            {filteredProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, 'PPP') : 'Pick due date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={onDueDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default TaskProjectAndDateForm;
