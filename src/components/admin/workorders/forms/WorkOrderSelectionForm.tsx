
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Contractor } from '@/hooks/useWorkOrderManagement';

interface WorkOrderSelectionFormProps {
  formData: {
    priority: string;
    status: string;
    contractor_id: string;
    property_id: string;
  };
  contractors: Contractor[];
  properties: any[];
  onFormChange: (field: string, value: string) => void;
}

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const statuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

const WorkOrderSelectionForm = ({ 
  formData, 
  contractors, 
  properties, 
  onFormChange 
}: WorkOrderSelectionFormProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => onFormChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => onFormChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contractor</Label>
          <Select
            value={formData.contractor_id}
            onValueChange={(value) => onFormChange('contractor_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contractor..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Contractor</SelectItem>
              {contractors.map((contractor) => (
                <SelectItem key={contractor.id} value={contractor.id}>
                  {contractor.name} - {contractor.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Property</Label>
          <Select
            value={formData.property_id}
            onValueChange={(value) => onFormChange('property_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property..." />
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
      </div>
    </>
  );
};

export default WorkOrderSelectionForm;
