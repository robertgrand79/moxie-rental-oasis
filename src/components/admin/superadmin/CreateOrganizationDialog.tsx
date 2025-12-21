import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateOrganizationDialog: React.FC<CreateOrganizationDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Fetch available users
  const { data: users } = useQuery({
    queryKey: ['platform-users-for-org'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');
      
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Check slug availability
  const { data: isSlugAvailable, isLoading: checkingSlug } = useQuery({
    queryKey: ['check-slug', slug],
    queryFn: async () => {
      if (!slug || slug.length < 2) return null;
      
      const { data, error } = await supabase.rpc('is_slug_available', { _slug: slug });
      if (error) throw error;
      return data;
    },
    enabled: slug.length >= 2,
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);
      setSlug(generatedSlug);
    }
  }, [name, slugManuallyEdited]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('');
      setSlug('');
      setOwnerId('');
      setSlugManuallyEdited(false);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!name || !slug || !ownerId) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isSlugAvailable) {
      toast.error('Slug is not available');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_organization_with_owner', {
        _name: name,
        _slug: slug,
        _user_id: ownerId,
      });

      if (error) throw error;

      toast.success(`Organization "${name}" created successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error(error.message || 'Failed to create organization');
    } finally {
      setIsCreating(false);
    }
  };

  const canCreate = name && slug && ownerId && isSlugAvailable && !checkingSlug;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Organization
          </DialogTitle>
          <DialogDescription>
            Create a new organization and assign an owner.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              placeholder="Test Vacation Rentals"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="relative">
              <Input
                id="slug"
                placeholder="test-vacation-rentals"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  setSlugManuallyEdited(true);
                }}
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingSlug && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!checkingSlug && slug.length >= 2 && isSlugAvailable === true && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {!checkingSlug && slug.length >= 2 && isSlugAvailable === false && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            {!checkingSlug && slug.length >= 2 && isSlugAvailable === false && (
              <p className="text-xs text-destructive">This slug is already taken</p>
            )}
            <p className="text-xs text-muted-foreground">
              Will be accessible at: yoursite.com/{slug || 'slug'}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="owner">Owner</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an owner" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <span className="flex flex-col">
                      <span>{user.full_name || 'No name'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Organization'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganizationDialog;
