
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Property } from '@/types/property';
import { PropertyProject } from '@/hooks/property-management/types';

interface TaskSelectionFormProps {
  formData: {
    property_id: string;
    project_id: string;
  };
  properties: Property[];
  projects: PropertyProject[];
  onFormDataChange: (data: any) => void;
}

const TaskSelectionForm = ({ formData, properties, projects, onFormDataChange }: TaskSelectionFormProps) => {
  return (
    <>
      <div>
        <Label htmlFor="property">Property (Optional)</Label>
        <Select value={formData.property_id} onValueChange={(value) => onFormDataChange({ ...formData, property_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Property</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="project">Project (Optional)</Label>
        <Select value={formData.project_id} onValueChange={(value) => onFormDataChange({ ...formData, project_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Project</SelectItem>
            {projects
              .filter(project => !formData.property_id || formData.property_id === "none" || project.property_id === formData.property_id)
              .map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default TaskSelectionForm;
