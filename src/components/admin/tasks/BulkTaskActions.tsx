
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ChevronDown, 
  Trash2, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Users,
  Target
} from 'lucide-react';
import { useBulkTaskOperations } from '@/hooks/useBulkTaskOperations';

interface BulkTaskActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onRefresh: () => void;
}

const BulkTaskActions = ({ selectedCount, onClearSelection, onRefresh }: BulkTaskActionsProps) => {
  const {
    selectedTaskIds,
    bulkDeleteTasks,
    bulkUpdateStatus,
    bulkUpdatePriority,
    isProcessing
  } = useBulkTaskOperations();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleBulkDelete = async () => {
    const success = await bulkDeleteTasks(selectedTaskIds);
    if (success) {
      onClearSelection();
      onRefresh();
    }
    setShowDeleteDialog(false);
  };

  const handleStatusChange = async (status: string) => {
    const success = await bulkUpdateStatus(selectedTaskIds, status);
    if (success) {
      onClearSelection();
      onRefresh();
    }
  };

  const handlePriorityChange = async (priority: string) => {
    const success = await bulkUpdatePriority(selectedTaskIds, priority);
    if (success) {
      onClearSelection();
      onRefresh();
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        {selectedCount} task{selectedCount > 1 ? 's' : ''} selected
      </Badge>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Change Status
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
              <Target className="h-4 w-4 mr-2" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('blocked')}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Blocked
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              <Target className="h-4 w-4 mr-2" />
              Change Priority
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-green-500 mr-2"></div>
                Low
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-yellow-500 mr-2"></div>
                Medium
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-orange-500 mr-2"></div>
                High
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('critical')}>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-red-500 mr-2"></div>
                Critical
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isProcessing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isProcessing}
        >
          Clear Selection
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} task{selectedCount > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
              Delete Tasks
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BulkTaskActions;
