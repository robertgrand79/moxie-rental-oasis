import { usePlatformAdmins, PlatformAdmin } from '@/hooks/usePlatformAdmins';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PlatformAdminSelectProps {
  value: string | null;
  onChange: (userId: string | null) => void;
  placeholder?: string;
  allowUnassigned?: boolean;
  showRoleOption?: boolean;
  roleValue?: string | null;
  onRoleChange?: (role: string | null) => void;
  disabled?: boolean;
}

export const PlatformAdminSelect = ({
  value,
  onChange,
  placeholder = 'Select assignee',
  allowUnassigned = true,
  showRoleOption = false,
  roleValue,
  onRoleChange,
  disabled = false,
}: PlatformAdminSelectProps) => {
  const { admins, isLoading } = usePlatformAdmins();

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  // If showing role option and a role is selected, show role selector
  if (showRoleOption && roleValue) {
    return (
      <div className="space-y-2">
        <Select
          value="role"
          onValueChange={(val) => {
            if (val === 'unassigned') {
              onRoleChange?.(null);
              onChange(null);
            } else if (val === 'specific') {
              onRoleChange?.(null);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {allowUnassigned && (
              <SelectItem value="unassigned">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Unassigned</span>
                </div>
              </SelectItem>
            )}
            <SelectItem value="specific">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Specific Admin</span>
              </div>
            </SelectItem>
            <SelectItem value="role">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>By Role (Round-Robin)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={roleValue}
          onValueChange={(val) => onRoleChange?.(val)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="platform_admin">Platform Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Standard admin selector
  const handleValueChange = (val: string) => {
    if (val === 'unassigned') {
      onChange(null);
      onRoleChange?.(null);
    } else if (val === 'role_platform_admin') {
      onChange(null);
      onRoleChange?.('platform_admin');
    } else if (val === 'role_super_admin') {
      onChange(null);
      onRoleChange?.('super_admin');
    } else {
      onChange(val);
      onRoleChange?.(null);
    }
  };

  const currentValue = value || (roleValue ? `role_${roleValue}` : 'unassigned');

  return (
    <Select
      value={currentValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {value ? (
            <AdminOption admin={admins.find(a => a.user_id === value)} />
          ) : roleValue ? (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>By Role: {roleValue === 'super_admin' ? 'Super Admin' : 'Platform Admin'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Unassigned</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowUnassigned && (
          <SelectItem value="unassigned">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Unassigned</span>
            </div>
          </SelectItem>
        )}
        
        {showRoleOption && (
          <>
            <SelectItem value="role_platform_admin">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>By Role: Platform Admin</span>
              </div>
            </SelectItem>
            <SelectItem value="role_super_admin">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>By Role: Super Admin</span>
              </div>
            </SelectItem>
          </>
        )}
        
        {admins.map((admin) => (
          <SelectItem key={admin.user_id} value={admin.user_id}>
            <AdminOption admin={admin} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const AdminOption = ({ admin }: { admin?: PlatformAdmin }) => {
  if (!admin) {
    return (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>Unknown</span>
      </div>
    );
  }

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-5 w-5">
        <AvatarImage src={admin.avatar_url || undefined} />
        <AvatarFallback className="text-[10px]">
          {getInitials(admin.full_name, admin.email)}
        </AvatarFallback>
      </Avatar>
      <span>{admin.full_name || admin.email}</span>
      {admin.role === 'super_admin' && (
        <span className="text-xs text-muted-foreground">(Super)</span>
      )}
    </div>
  );
};

export default PlatformAdminSelect;
