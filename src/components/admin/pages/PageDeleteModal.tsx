import React from 'react';
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

interface Page {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
}

interface PageDeleteModalProps {
  page: Page | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PageDeleteModal = ({ page, open, onClose, onConfirm }: PageDeleteModalProps) => {
  if (!page) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Page</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the page <strong>"{page.title}"</strong>?
            {page.is_published && (
              <span className="block mt-2 text-destructive">
                This page is currently published and will no longer be accessible to visitors.
              </span>
            )}
            <span className="block mt-2">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Page
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PageDeleteModal;