
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EnhancedSubscriber } from '@/components/newsletter/types';

interface DeleteSubscriberModalProps {
  subscriber: EnhancedSubscriber | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting: boolean;
}

const DeleteSubscriberModal = ({ subscriber, open, onClose, onConfirm, isDeleting }: DeleteSubscriberModalProps) => {
  const handleConfirm = async () => {
    if (subscriber) {
      await onConfirm(subscriber.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Contact</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete {subscriber?.name || 'this contact'}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubscriberModal;
