import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Mail, Edit } from 'lucide-react';
import StreamlinedNewsletterEditor from '@/components/newsletter/StreamlinedNewsletterEditor';
import NewsletterForm from '../NewsletterForm';

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  cover_image_url?: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsletterEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsletter?: Newsletter | null;
  onClose?: () => void;
}

const NewsletterEditorDrawer = ({ open, onOpenChange, newsletter, onClose }: NewsletterEditorDrawerProps) => {
  const isEditing = !!newsletter;

  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  // If editing, use the NewsletterForm dialog instead of drawer
  if (isEditing && open) {
    return (
      <NewsletterForm
        newsletter={newsletter}
        onClose={handleClose}
      />
    );
  }

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
