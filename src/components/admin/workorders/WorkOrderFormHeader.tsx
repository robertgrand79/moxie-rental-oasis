
import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
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
    <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="flex items-center gap-2 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Work Order' : 'Create Work Order'}
        </h2>
        {workOrder && (
          <Badge variant="outline" className="text-sm sm:text-lg px-2 sm:px-3 py-1">
            {workOrder.work_order_number}
          </Badge>
        )}
      </div>
      <EnhancedButton 
        variant="ghost" 
        size="sm" 
        onClick={onClose}
        className="min-h-[44px] sm:min-h-auto"
      >
        <X className="h-5 w-5" />
      </EnhancedButton>
    </div>
  );
};

export default WorkOrderFormHeader;
