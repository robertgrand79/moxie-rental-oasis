import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { PlayCircle } from 'lucide-react';
import { ChecklistRun, ChecklistTemplate } from '@/hooks/useChecklistManagement';
import ActiveChecklistsTab from '../ActiveChecklistsTab';

interface ActiveChecklistsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runs: ChecklistRun[];
  templates: ChecklistTemplate[];
  onToggleItem: (completionId: string, isCompleted: boolean, runId: string) => Promise<void>;
  onUpdateCompletion?: (completionId: string, updates: { notes?: string; photos?: string[]; needs_work?: boolean }) => Promise<boolean>;
  onDeleteRun: (runId: string) => Promise<void>;
  onCreateWorkOrder?: (propertyId: string, items: { title: string; description: string; notes?: string; photos?: string[] }[]) => Promise<void>;
  initialSelectedRunId?: string | null;
  onClearSelection?: () => void;
}

const ActiveChecklistsDrawer = ({ 
  open, 
  onOpenChange,
  runs,
  templates,
  onToggleItem,
  onUpdateCompletion,
  onDeleteRun,
  onCreateWorkOrder,
  initialSelectedRunId,
  onClearSelection
}: ActiveChecklistsDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Active Checklists ({runs.length})
          </DrawerTitle>
          <DrawerDescription>
            In-progress maintenance checklists
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          <ActiveChecklistsTab 
            runs={runs} 
            templates={templates}
            onToggleItem={onToggleItem}
            onUpdateCompletion={onUpdateCompletion}
            onDeleteRun={onDeleteRun}
            onCreateWorkOrder={onCreateWorkOrder}
            initialSelectedRunId={initialSelectedRunId}
            onClearSelection={onClearSelection}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ActiveChecklistsDrawer;
