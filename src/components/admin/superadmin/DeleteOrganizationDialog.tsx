import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Archive, Trash2 } from 'lucide-react';

interface DeleteOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
  memberCount: number;
  propertyCount: number;
  onConfirmDelete: () => void;
  onArchiveInstead?: () => void;
  isLoading?: boolean;
}

export default function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organizationName,
  memberCount,
  propertyCount,
  onConfirmDelete,
  onArchiveInstead,
  isLoading = false,
}: DeleteOrganizationDialogProps) {
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [confirmText, setConfirmText] = useState('');

  const isConfirmValid = confirmText === organizationName;

  const handleConfirmDelete = () => {
    if (isConfirmValid) {
      onConfirmDelete();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep('warning');
      setConfirmText('');
    }
    onOpenChange(newOpen);
  };

  const handleArchiveInstead = () => {
    handleOpenChange(false);
    onArchiveInstead?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        {step === 'warning' ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Organization Permanently?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    This will <strong>permanently delete</strong> "{organizationName}" and:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>{memberCount}</strong> user account(s) will be permanently deleted</li>
                    <li><strong>{propertyCount}</strong> properties and all related data</li>
                    <li>All reservations, guests, and communications</li>
                    <li>All settings, integrations, and configurations</li>
                  </ul>
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                    This action CANNOT be undone. All data will be permanently lost.
                  </div>
                  {onArchiveInstead && (
                    <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm">
                      <Archive className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>Consider <strong>archiving</strong> instead if you may need this data later.</span>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {onArchiveInstead && (
                <Button variant="outline" onClick={handleArchiveInstead}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Instead
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => setStep('confirm')}
              >
                Continue to Delete
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Confirm Permanent Deletion
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    To confirm deletion, type the organization name below:
                  </p>
                  <div className="p-2 bg-muted rounded font-mono text-sm text-center">
                    {organizationName}
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2 py-2">
              <Label htmlFor="confirm-name">Type organization name to confirm</Label>
              <Input
                id="confirm-name"
                placeholder={organizationName}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading} onClick={() => setStep('warning')}>
                Back
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={!isConfirmValid || isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
