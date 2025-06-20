
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Calendar, User, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkOrderSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  contractors: any[];
  onSave: (data: any) => void;
  isEditing: boolean;
}

const WorkOrderSidePanel = ({
  isOpen,
  onClose,
  workOrder,
  contractors,
  onSave,
  isEditing,
}: WorkOrderSidePanelProps) => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'draft',
    contractor_id: '',
    estimated_completion_date: '',
    scope_of_work: '',
    special_instructions: '',
  });

  React.useEffect(() => {
    if (workOrder) {
      setFormData({
        title: workOrder.title || '',
        description: workOrder.description || '',
        priority: workOrder.priority || 'medium',
        status: workOrder.status || 'draft',
        contractor_id: workOrder.contractor_id || '',
        estimated_completion_date: workOrder.estimated_completion_date || '',
        scope_of_work: workOrder.scope_of_work || '',
        special_instructions: workOrder.special_instructions || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'draft',
        contractor_id: '',
        estimated_completion_date: '',
        scope_of_work: '',
        special_instructions: '',
      });
    }
  }, [workOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Work Order' : 'Create Work Order'}
              </h2>
              {workOrder && (
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {workOrder.work_order_number}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
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
                <Label htmlFor="contractor">Contractor</Label>
                <Select value={formData.contractor_id} onValueChange={(value) => setFormData(prev => ({ ...prev, contractor_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contractor" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="estimated_completion_date">Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="estimated_completion_date"
                    type="date"
                    value={formData.estimated_completion_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion_date: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What work needs to be done?"
                  rows={3}
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="scope_of_work">Scope of Work</Label>
                <Textarea
                  id="scope_of_work"
                  value={formData.scope_of_work}
                  onChange={(e) => setFormData(prev => ({ ...prev, scope_of_work: e.target.value }))}
                  placeholder="Detailed scope and requirements"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                  placeholder="Any special notes or requirements"
                  rows={2}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? 'Update Work Order' : 'Create Work Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderSidePanel;
