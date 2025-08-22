
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, LogOut } from 'lucide-react';
import { SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminSidebarFooter = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.'
      });
      navigate('/');
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <SidebarFooter>
      <div className={`border-t border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center space-x-3 ${isMobile ? 'mb-2' : 'mb-3'}`}>
          <div className={`flex items-center bg-gray-50 rounded-lg flex-1 ${isMobile ? 'px-2 py-2' : 'px-3 py-2'}`}>
            <User className="h-4 w-4 text-icon-gray mr-2" />
            <span className={`font-medium text-gray-700 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </SidebarFooter>
  );
};

export default AdminSidebarFooter;
