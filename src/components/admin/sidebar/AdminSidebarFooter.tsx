
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
      </div>
    </SidebarFooter>
  );
};

export default AdminSidebarFooter;
