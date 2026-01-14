import React from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoadmapItem } from '@/hooks/usePlatformRoadmap';
import { cn } from '@/lib/utils';

interface RoadmapListViewProps {
  items: RoadmapItem[];
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

const categoryColors: Record<RoadmapItem['category'], string> = {
  'feature': 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  'improvement': 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300',
  'bug-fix': 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300',
  'infrastructure': 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300',
  'security': 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  'performance': 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
};

export const RoadmapListView: React.FC<RoadmapListViewProps> = ({
  items,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No roadmap items found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Phase</TableHead>
            <TableHead>Target Date</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className={cn(item.status === 'completed' && 'opacity-60')}>
              <TableCell>
                <div>
                  <p className={cn(
                    'font-medium',
                    item.status === 'completed' && 'line-through'
                  )}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={categoryColors[item.category]}>
                  {item.category}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[item.priority]} variant="secondary">
                  {item.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Select
                  value={item.status}
                  onValueChange={(value) => onStatusChange(item.id, value as RoadmapItem['status'])}
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {item.phase || '—'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {item.target_date ? format(new Date(item.target_date), 'MMM d, yyyy') : '—'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
