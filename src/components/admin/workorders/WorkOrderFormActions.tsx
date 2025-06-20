
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface WorkOrderFormActionsProps {
  isEditing: boolean;
  onClose: () => void;
}

const WorkOrderFormActions = ({ isEditing, onClose }: WorkOrderFormActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        {isEditing ? 'Update Work Order' : 'Create Work Order'}
      </Button>
    </div>
  );
};

export default WorkOrderFormActions;
