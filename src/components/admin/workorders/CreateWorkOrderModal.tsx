
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Contractor, WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useProperties } from '@/hooks/useProperties';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkOrder: (workOrderData: any) => Promise<void>;
  contractors: Contractor[];
  editingWorkOrder?: WorkOrder | null;
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

const CreateWorkOrderModal = ({ 
  isOpen, 
  onClose, 
  onCreateWorkOrder, 
  contractors, 
  editingWorkOrder 
}: CreateWorkOrderModalProps) => {
  const { properties } = useProperties();
  
  const [formData, setFormData] = useState({
    title: editingWorkOrder?.title || '',
    description: editingWorkOrder?.description || '',
    scope_of_work: editingWorkOrder?.scope_of_work || '',
    status: editingWorkOrder?.status || 'draft',
    priority: editingWorkOrder?.priority || 'medium',
    contractor_id: editingWorkOrder?.contractor_id || 'none',
    property_id: editingWorkOrder?.property_id || 'none',
    estimated_cost: editingWorkOrder?.estimated_cost?.toString() || '',
    actual_cost: editingWorkOrder?.actual_cost?.toString() || '',
    requires_permits: editingWorkOrder?.requires_permits || false,
    special_instructions: editingWorkOrder?.special_instructions || '',
  });
  
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<Date | undefined>(
    editingWorkOrder?.estimated_completion_date ? new Date(editingWorkOrder.estimated_completion_date) : undefined
  );
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateWorkOrder({
        ...formData,
        contractor_id: formData.contractor_id === 'none' ? undefined : formData.contractor_id,
        property_id: formData.property_id === 'none' ? undefined : formData.property_id,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : undefined,
        estimated_completion_date: estimatedCompletionDate ? format(estimatedCompletionDate, 'yyyy-MM-dd') : undefined,
      });
      
      setFormData({
        title: '',
        description: '',
        scope_of_work: '',
        status: 'draft',
        priority: 'medium',
        contractor_id: 'none',
        property_id: 'none',
        estimated_cost: '',
        actual_cost: '',
        requires_permits: false,
        special_instructions: '',
      });
      setEstimatedCompletionDate(undefined);
      onClose();
    } catch (error) {
      console.error('Error creating work order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingWorkOrder ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Work Order Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter work order title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work needed..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="scope_of_work">Scope of Work</Label>
            <Textarea
              id="scope_of_work"
              value={formData.scope_of_work}
              onChange={(e) => setFormData({ ...formData, scope_of_work: e.target.value })}
              placeholder="Detailed scope of work..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
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
                onValueChange={(value) => setFormData({ ...formData, status: value })}
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
                onValueChange={(value) => setFormData({ ...formData, contractor_id: value })}
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
                onValueChange={(value) => setFormData({ ...formData, property_id: value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="actual_cost">Actual Cost ($)</Label>
              <Input
                id="actual_cost"
                type="number"
                step="0.01"
                value={formData.actual_cost}
                onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

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
                  onSelect={setEstimatedCompletionDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requires_permits"
              checked={formData.requires_permits}
              onCheckedChange={(checked) => setFormData({ ...formData, requires_permits: checked as boolean })}
            />
            <Label htmlFor="requires_permits">Requires permits</Label>
          </div>

          <div>
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder="Any special instructions for the contractor..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : editingWorkOrder ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkOrderModal;
