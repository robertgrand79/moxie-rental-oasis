
import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
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

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
  preferences: any;
}

interface DeleteSubscriberModalProps {
  subscriber: Subscriber | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting: boolean;
}

const DeleteSubscriberModal = ({ 
  subscriber, 
  open, 
  onClose, 
  onConfirm, 
  isDeleting 
}: DeleteSubscriberModalProps) => {
  const handleConfirm = async () => {
    if (subscriber) {
      await onConfirm(subscriber.id);
      onClose();
    }
  };

  if (!subscriber) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Subscriber
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the subscriber "{subscriber.email}"?
            {subscriber.name && (
              <span> ({subscriber.name})</span>
            )}
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              <strong>Warning:</strong> This will permanently remove the subscriber from your newsletter list.
            </div>
            <div className="mt-2 text-sm text-gray-600">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Subscriber
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSubscriberModal;
