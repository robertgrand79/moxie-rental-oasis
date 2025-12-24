import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedPageForm from '@/components/EnhancedPageForm';

interface PageFormData {
  title: string;
  slug: string;
  content?: string;
  status?: string;
  meta_title?: string;
  meta_description?: string;
}

interface Page extends PageFormData {
  id: string;
  created_at?: string;
  updated_at?: string;
}

interface PageFormDialogProps {
  page?: Page;
  onSubmit: (data: PageFormData) => void;
  onClose: () => void;
}

const PageFormDialog = ({ page, onSubmit, onClose }: PageFormDialogProps) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {page ? 'Edit Page' : 'Create New Page'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EnhancedPageForm 
            page={page}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageFormDialog;