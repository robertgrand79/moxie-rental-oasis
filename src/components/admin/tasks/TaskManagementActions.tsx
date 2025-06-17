
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface TaskManagementActionsProps {
  bulkMode: boolean;
  onToggleBulkMode: () => void;
  onSelectAllTasks: () => void;
  onOpenTaskTypeModal: () => void;
  tasksCount: number;
}

const TaskManagementActions = ({
  bulkMode,
  onToggleBulkMode,
  onSelectAllTasks,
  onOpenTaskTypeModal,
  tasksCount,
}: TaskManagementActionsProps) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-3">
        <Button
          variant={bulkMode ? "default" : "outline"}
          onClick={onToggleBulkMode}
        >
          {bulkMode ? "Exit Bulk Mode" : "Bulk Select"}
        </Button>
        
        {bulkMode && (
          <Button
            variant="outline"
            onClick={onSelectAllTasks}
            disabled={tasksCount === 0}
          >
            Select All ({tasksCount})
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        onClick={onOpenTaskTypeModal}
      >
        <Settings className="h-4 w-4 mr-2" />
        Manage Task Types
      </Button>
    </div>
  );
};

export default TaskManagementActions;
