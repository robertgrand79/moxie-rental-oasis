
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Property } from '@/types/property';

interface PropertyManagementHeaderProps {
  selectedProperty: string;
  onPropertyChange: (value: string) => void;
  properties: Property[];
}

const PropertyManagementHeader = ({
  selectedProperty,
  onPropertyChange,
  properties,
}: PropertyManagementHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
        <p className="text-gray-600">Comprehensive property operations, tasks, and project management</p>
      </div>
      
      <div className="flex gap-2">
        <Select value={selectedProperty} onValueChange={onPropertyChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PropertyManagementHeader;
