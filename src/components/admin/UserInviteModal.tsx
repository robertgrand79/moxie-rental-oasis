
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

const TEAM_ROLES = [
  { value: 'owner', label: 'Owner', description: 'Full access to everything including billing and team management' },
  { value: 'manager', label: 'Manager', description: 'Manage properties, bookings, content, and invite team members' },
  { value: 'staff', label: 'Staff', description: 'Day-to-day operations: bookings, guest communication, properties' },
  { value: 'maintenance', label: 'Maintenance', description: 'Work orders, tasks, and checklists only' },
  { value: 'cleaner', label: 'Cleaner', description: 'Work orders, tasks, and checklists only' },
  { value: 'view_only', label: 'View Only', description: 'Read-only access to dashboard and reports' },
] as const;

interface UserInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invitation: { email: string; role: string; full_name?: string; team_role?: string }) => Promise<boolean>;
}

const UserInviteModal = ({ isOpen, onClose, onInvite }: UserInviteModalProps) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [teamRole, setTeamRole] = useState('staff');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoleInfo = TEAM_ROLES.find(r => r.value === teamRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    const success = await onInvite({
      email: email.trim(),
      role: teamRole === 'owner' ? 'owner' : teamRole === 'manager' ? 'admin' : 'user',
      team_role: teamRole,
      full_name: fullName.trim() || undefined,
    });

    if (success) {
      setEmail('');
      setFullName('');
      setTeamRole('staff');
      onClose();
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setFullName('');
      setTeamRole('staff');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new member to your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="team@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (Optional)</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teamRole">Role</Label>
            <Select value={teamRole} onValueChange={setTeamRole} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoleInfo && (
              <p className="text-xs text-muted-foreground">{selectedRoleInfo.description}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserInviteModal;
