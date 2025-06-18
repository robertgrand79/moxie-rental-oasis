
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface WorkOrderPriorityBadgeProps {
  priority: string;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const WorkOrderPriorityBadge = ({ priority }: WorkOrderPriorityBadgeProps) => {
  return (
    <Badge className={priorityColors[priority as keyof typeof priorityColors]}>
      {priority}
    </Badge>
  );
};

export default WorkOrderPriorityBadge;
