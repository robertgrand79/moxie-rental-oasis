import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { History } from 'lucide-react';
import { ChecklistRun } from '@/hooks/useChecklistManagement';
import ChecklistHistoryTab from '../ChecklistHistoryTab';

interface ChecklistHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runs: ChecklistRun[];
}

const ChecklistHistoryDrawer = ({ open, onOpenChange, runs }: ChecklistHistoryDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Checklist History
          </DrawerTitle>
          <DrawerDescription>
            Completed maintenance checklists
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          <ChecklistHistoryTab runs={runs} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ChecklistHistoryDrawer;
