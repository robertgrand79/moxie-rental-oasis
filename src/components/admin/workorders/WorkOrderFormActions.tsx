
import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Save } from 'lucide-react';

interface WorkOrderFormActionsProps {
  isEditing: boolean;
  onClose: () => void;
}

const WorkOrderFormActions = ({ isEditing, onClose }: WorkOrderFormActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t">
      <EnhancedButton 
        type="button" 
        variant="outline" 
        onClick={onClose}
        className="min-h-[44px] sm:min-h-auto"
      >
        Cancel
      </EnhancedButton>
      <EnhancedButton 
        type="submit" 
        variant="gradient"
        className="flex items-center gap-2 min-h-[44px] sm:min-h-auto"
      >
        <Save className="h-4 w-4" />
        {isEditing ? 'Update Work Order' : 'Create Work Order'}
      </EnhancedButton>
    </div>
  );
};

export default WorkOrderFormActions;
