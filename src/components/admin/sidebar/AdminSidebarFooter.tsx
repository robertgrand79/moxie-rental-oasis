
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, LogOut } from 'lucide-react';
import { SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const AdminSidebarFooter = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg flex-1">
            <User className="h-4 w-4 text-icon-gray mr-2" />
            <span className="text-sm font-medium text-gray-700 truncate">{displayName}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4 mr-2 text-icon-gray" />
          Sign Out
        </Button>
      </div>
    </SidebarFooter>
  );
};

export default AdminSidebarFooter;
