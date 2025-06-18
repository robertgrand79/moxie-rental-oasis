
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface InteractiveWorkOrderPriorityBadgeProps {
  priority: string;
  workOrderId: string;
  onPriorityChange: (workOrderId: string, priority: string) => void;
  isUpdating?: boolean;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const InteractiveWorkOrderPriorityBadge = ({
  priority,
  workOrderId,
  onPriorityChange,
  isUpdating = false,
}: InteractiveWorkOrderPriorityBadgeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePriorityChange = async (newPriority: string) => {
    if (newPriority !== priority && !isUpdating) {
      await onPriorityChange(workOrderId, newPriority);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Badge 
          className={`${priorityColors[priority as keyof typeof priorityColors]} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
          onClick={(e) => e.stopPropagation()}
        >
          {priority}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-32 bg-white border shadow-lg z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {priorityOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handlePriorityChange(option.value)}
            className={`cursor-pointer ${priority === option.value ? 'bg-gray-100' : ''}`}
            disabled={isUpdating}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InteractiveWorkOrderPriorityBadge;
