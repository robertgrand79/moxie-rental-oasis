
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import TurnoSyncStatusBadge from './TurnoSyncStatusBadge';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

interface WorkOrderStatusBadgeProps {
  status: string;
  workOrder?: WorkOrder;
  showTurnoSync?: boolean;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  acknowledged: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  invoiced: 'bg-indigo-100 text-indigo-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'in_progress':
      return <Clock className="h-4 w-4" />;
    case 'cancelled':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

const WorkOrderStatusBadge = ({ status, workOrder, showTurnoSync = false }: WorkOrderStatusBadgeProps) => {
  return (
    <div className="flex items-center gap-2">
      <Badge className={`${statusColors[status as keyof typeof statusColors]} flex items-center gap-1 w-fit`}>
        {getStatusIcon(status)}
        {status.replace('_', ' ')}
      </Badge>
      {showTurnoSync && workOrder && (
        <TurnoSyncStatusBadge workOrder={workOrder} showActions={false} />
      )}
    </div>
  );
};

export default WorkOrderStatusBadge;
