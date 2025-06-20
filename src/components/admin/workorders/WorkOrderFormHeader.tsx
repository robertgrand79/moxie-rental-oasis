
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

interface WorkOrderFormHeaderProps {
  isEditing: boolean;
  workOrder: WorkOrder | null;
  onClose: () => void;
}

const WorkOrderFormHeader = ({ isEditing, workOrder, onClose }: WorkOrderFormHeaderProps) => {
  return (
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
  );
};

export default WorkOrderFormHeader;
