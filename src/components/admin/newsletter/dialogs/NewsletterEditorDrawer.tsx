import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Mail } from 'lucide-react';
import StreamlinedNewsletterEditor from '@/components/newsletter/StreamlinedNewsletterEditor';

interface NewsletterEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsletterEditorDrawer = ({ open, onOpenChange }: NewsletterEditorDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create Newsletter
          </DrawerTitle>
          <DrawerDescription>
            Create and send a new newsletter campaign
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          <StreamlinedNewsletterEditor />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewsletterEditorDrawer;
