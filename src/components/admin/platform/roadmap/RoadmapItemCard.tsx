import React from 'react';
import { format } from 'date-fns';
import { Calendar, MoreVertical, Pencil, Trash2, CheckCircle, Clock, Pause, Lightbulb, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { RoadmapItem } from '@/hooks/usePlatformRoadmap';

interface RoadmapItemCardProps {
  item: RoadmapItem;
  onEdit: (item: RoadmapItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: RoadmapItem['status']) => void;
}

const priorityColors: Record<RoadmapItem['priority'], string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-muted text-muted-foreground',
};

const statusIcons: Record<RoadmapItem['status'], React.ElementType> = {
  'idea': Lightbulb,
  'planned': Target,
  'in-progress': Clock,
  'completed': CheckCircle,
  'on-hold': Pause,
};

const categoryColors: Record<RoadmapItem['category'], string> = {
  'feature': 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  'improvement': 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300',
  'bug-fix': 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300',
  'infrastructure': 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300',
  'security': 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  'performance': 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
};

export const RoadmapItemCard: React.FC<RoadmapItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const StatusIcon = statusIcons[item.status];
  const allStatuses: RoadmapItem['status'][] = ['idea', 'planned', 'in-progress', 'completed', 'on-hold'];

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      item.status === 'completed' && 'opacity-75'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={priorityColors[item.priority]} variant="secondary">
                {item.priority}
              </Badge>
              <Badge variant="outline" className={categoryColors[item.category]}>
                {item.category}
              </Badge>
              {item.phase && (
                <Badge variant="outline" className="text-muted-foreground">
                  {item.phase}
                </Badge>
              )}
            </div>
            
            <h4 className={cn(
              'font-medium text-sm mb-1',
              item.status === 'completed' && 'line-through text-muted-foreground'
            )}>
              {item.title}
            </h4>
            
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                <span className="capitalize">{item.status.replace('-', ' ')}</span>
              </div>
              {item.target_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(item.target_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {allStatuses.filter(s => s !== item.status).map((status) => {
                const Icon = statusIcons[status];
                return (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => onStatusChange(item.id, status)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    Mark as {status.replace('-', ' ')}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
