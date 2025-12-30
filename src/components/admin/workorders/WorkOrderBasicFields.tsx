
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Building, Wrench } from 'lucide-react';

interface FormData {
  title: string;
  priority: string;
  status: string;
  contractor_id: string;
  assigned_user_id?: string;
  property_id: string;
  [key: string]: any;
}

interface PropertyOption {
  id: string;
  title: string;
}

interface ContractorOption {
  id: string;
  name: string;
  company_name?: string;
}

interface OrganizationUser {
  id: string;
  full_name?: string;
  email: string;
}

interface WorkOrderBasicFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  properties: PropertyOption[];
  contractors: ContractorOption[];
  organizationUsers?: OrganizationUser[];
}

const WorkOrderBasicFields = ({
  formData,
  setFormData,
  properties,
  contractors,
  organizationUsers = [],
}: WorkOrderBasicFieldsProps) => {
  // Determine assignment type based on current data
  const getAssignmentType = () => {
    if (formData.contractor_id && formData.contractor_id !== '' && formData.contractor_id !== 'none') {
      return 'contractor';
    }
    if (formData.assigned_user_id && formData.assigned_user_id !== '' && formData.assigned_user_id !== 'none') {
      return 'user';
    }
    return 'none';
  };

  const [assignmentType, setAssignmentType] = React.useState<'none' | 'contractor' | 'user'>(getAssignmentType());

  // Update assignment type when formData changes (e.g., when editing)
  React.useEffect(() => {
    setAssignmentType(getAssignmentType());
  }, [formData.contractor_id, formData.assigned_user_id]);

  const handlePropertyChange = (value: string) => {
    const propertyId = value === 'none' ? '' : value;
    setFormData((prev: FormData) => ({ ...prev, property_id: propertyId }));
  };

  const handleContractorChange = (value: string) => {
    const contractorId = value === 'none' ? '' : value;
    setFormData((prev: FormData) => ({ 
      ...prev, 
      contractor_id: contractorId,
      assigned_user_id: '' // Clear user assignment when contractor is selected
    }));
  };

  const handleUserChange = (value: string) => {
    const userId = value === 'none' ? '' : value;
    setFormData((prev: FormData) => ({ 
      ...prev, 
      assigned_user_id: userId,
      contractor_id: '' // Clear contractor assignment when user is selected
    }));
  };

  const handleAssignmentTypeChange = (type: 'none' | 'contractor' | 'user') => {
    setAssignmentType(type);
    if (type === 'none') {
      setFormData((prev: FormData) => ({ 
        ...prev, 
        contractor_id: '',
        assigned_user_id: ''
      }));
    } else if (type === 'contractor') {
      setFormData((prev: FormData) => ({ ...prev, assigned_user_id: '' }));
    } else if (type === 'user') {
      setFormData((prev: FormData) => ({ ...prev, contractor_id: '' }));
    }
  };

  const priorityColors = {
    low: 'bg-emerald-50 text-emerald-700',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-orange-50 text-orange-700',
    critical: 'bg-red-50 text-red-700',
  };

  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-blue-50 text-blue-700',
    acknowledged: 'bg-purple-50 text-purple-700',
    in_progress: 'bg-amber-50 text-amber-700',
    completed: 'bg-emerald-50 text-emerald-700',
    invoiced: 'bg-indigo-50 text-indigo-700',
    paid: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Work Order Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((prev: FormData) => ({ ...prev, title: e.target.value }))}
          placeholder="Brief description of work needed"
          required
        />
      </div>

      {/* Property */}
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

      {/* Assignment Type Selection */}
      <div className="space-y-3">
        <Label>Assign To</Label>
        <RadioGroup 
          value={assignmentType} 
          onValueChange={(value) => handleAssignmentTypeChange(value as 'none' | 'contractor' | 'user')}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="assign-none" />
            <Label htmlFor="assign-none" className="font-normal cursor-pointer">Unassigned</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="contractor" id="assign-contractor" />
            <Label htmlFor="assign-contractor" className="font-normal cursor-pointer flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              Contractor
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="user" id="assign-user" />
            <Label htmlFor="assign-user" className="font-normal cursor-pointer flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Team Member
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Contractor Dropdown - only show if contractor assignment type */}
      {assignmentType === 'contractor' && (
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
                    <Wrench className="h-4 w-4" />
                    <span>{contractor.name}</span>
                    {contractor.company_name && (
                      <span className="text-muted-foreground">({contractor.company_name})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Team Member Dropdown - only show if user assignment type */}
      {assignmentType === 'user' && (
        <div className="space-y-2">
          <Label htmlFor="assigned_user">Team Member</Label>
          <Select 
            value={formData.assigned_user_id || 'none'} 
            onValueChange={handleUserChange}
            disabled={organizationUsers.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={organizationUsers.length === 0 ? "Loading team members..." : "Select team member"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Team Member</SelectItem>
              {organizationUsers.length > 0 ? (
                organizationUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{user.full_name || user.email}</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>
                  <span className="text-muted-foreground">No team members found</span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData((prev: FormData) => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(priorityColors).map(([priority, colorClass]) => (
                <SelectItem key={priority} value={priority}>
                  <Badge className={colorClass}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData((prev: FormData) => ({ ...prev, status: value }))}>
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
    </div>
  );
};

export default WorkOrderBasicFields;
