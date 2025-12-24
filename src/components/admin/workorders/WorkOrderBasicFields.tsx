
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Building } from 'lucide-react';

interface FormData {
  title: string;
  priority: string;
  status: string;
  contractor_id: string;
  property_id: string;
}

interface WorkOrderBasicFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  properties: any[];
  contractors: any[];
}

const WorkOrderBasicFields = ({
  formData,
  setFormData,
  properties,
  contractors,
}: WorkOrderBasicFieldsProps) => {
  const handlePropertyChange = (value: string) => {
    const propertyId = value === 'none' ? '' : value;
    setFormData(prev => ({ ...prev, property_id: propertyId }));
  };

  const handleContractorChange = (value: string) => {
    const contractorId = value === 'none' ? '' : value;
    setFormData(prev => ({ ...prev, contractor_id: contractorId }));
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    acknowledged: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    invoiced: 'bg-indigo-100 text-indigo-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="title">Work Order Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Brief description of work needed"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="property">
          Property <span className="text-destructive">*</span>
        </Label>
        <Select value={formData.property_id || 'none'} onValueChange={handlePropertyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{property.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contractor">Contractor</Label>
        <Select value={formData.contractor_id || 'none'} onValueChange={handleContractorChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select contractor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Contractor</SelectItem>
            {contractors.map((contractor) => (
              <SelectItem key={contractor.id} value={contractor.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{contractor.name}</span>
                  {contractor.company_name && (
                    <span className="text-gray-500">({contractor.company_name})</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">
              <Badge className={priorityColors.low}>Low</Badge>
            </SelectItem>
            <SelectItem value="medium">
              <Badge className={priorityColors.medium}>Medium</Badge>
            </SelectItem>
            <SelectItem value="high">
              <Badge className={priorityColors.high}>High</Badge>
            </SelectItem>
            <SelectItem value="critical">
              <Badge className={priorityColors.critical}>Critical</Badge>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusColors).map(([status, colorClass]) => (
              <SelectItem key={status} value={status}>
                <Badge className={colorClass}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default WorkOrderBasicFields;
