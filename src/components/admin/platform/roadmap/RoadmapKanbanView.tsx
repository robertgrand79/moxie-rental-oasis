import React from 'react';
import { Lightbulb, Target, Clock, CheckCircle, Pause } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { RoadmapItem } from '@/hooks/usePlatformRoadmap';
import { RoadmapItemCard } from './RoadmapItemCard';
import { cn } from '@/lib/utils';

interface RoadmapKanbanViewProps {
  items: RoadmapItem[];
  onEdit: (item: RoadmapItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: RoadmapItem['status']) => void;
}

const columns: { key: RoadmapItem['status']; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'idea', label: 'Ideas', icon: Lightbulb, color: 'border-purple-500' },
  { key: 'planned', label: 'Planned', icon: Target, color: 'border-blue-500' },
  { key: 'in-progress', label: 'In Progress', icon: Clock, color: 'border-yellow-500' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'border-green-500' },
  { key: 'on-hold', label: 'On Hold', icon: Pause, color: 'border-muted-foreground' },
];

export const RoadmapKanbanView: React.FC<RoadmapKanbanViewProps> = ({
  items,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getColumnItems = (status: RoadmapItem['status']) => {
    return items
      .filter(item => item.status === status)
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {columns.map(({ key, label, icon: Icon, color }) => {
          const columnItems = getColumnItems(key);
          return (
            <div 
              key={key} 
              className={cn(
                'w-72 flex-shrink-0 rounded-lg bg-muted/30 border-t-2',
                color
              )}
            >
              <div className="p-3 border-b bg-muted/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">{label}</h3>
                  <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                    {columnItems.length}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-320px)] overflow-y-auto">
                {columnItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No items
                  </p>
                ) : (
                  columnItems.map(item => (
                    <RoadmapItemCard
                      key={item.id}
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
