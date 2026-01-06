import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Settings, Archive, Trash2, RotateCcw } from 'lucide-react';
import ArchiveOrganizationDialog from './ArchiveOrganizationDialog';
import DeleteOrganizationDialog from './DeleteOrganizationDialog';

interface OrganizationActionsMenuProps {
  organizationId: string;
  organizationName: string;
  memberCount: number;
  propertyCount: number;
  isArchived: boolean;
  onViewDetails: () => void;
  onEditSettings?: () => void;
  onArchive: (reason?: string) => void;
  onRestore: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export default function OrganizationActionsMenu({
  organizationId,
  organizationName,
  memberCount,
  propertyCount,
  isArchived,
  onViewDetails,
  onEditSettings,
  onArchive,
  onRestore,
  onDelete,
  isLoading = false,
}: OrganizationActionsMenuProps) {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleArchiveConfirm = (reason?: string) => {
    onArchive(reason);
    setShowArchiveDialog(false);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  const handleArchiveInstead = () => {
    setShowDeleteDialog(false);
    setShowArchiveDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onViewDetails}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          {onEditSettings && (
            <DropdownMenuItem onClick={onEditSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Settings
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isArchived ? (
            <>
              <DropdownMenuItem onClick={onRestore} disabled={isLoading}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore Organization
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() => setShowArchiveDialog(true)}
                className="text-warning focus:text-warning"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Organization
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ArchiveOrganizationDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        organizationName={organizationName}
        onConfirm={handleArchiveConfirm}
        isLoading={isLoading}
      />

      <DeleteOrganizationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        organizationName={organizationName}
        memberCount={memberCount}
        propertyCount={propertyCount}
        onConfirmDelete={handleDeleteConfirm}
        onArchiveInstead={isArchived ? undefined : handleArchiveInstead}
        isLoading={isLoading}
      />
    </>
  );
}
