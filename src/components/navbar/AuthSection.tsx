
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from '@/hooks/use-toast';
import { LogOut, User, Settings, Shield } from 'lucide-react';

const AuthSection = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin') || 
                     location.pathname.startsWith('/properties') || 
                     location.pathname.startsWith('/blog-management') || 
                     location.pathname.startsWith('/site-settings');

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
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 text-icon-gray mr-2" />
              <span className="text-sm font-medium text-gray-700">{displayName}</span>
            </div>
          </div>
          
          {!isAdminPage && (
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Shield className="h-4 w-4 mr-2 text-icon-gray" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            </Link>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4 mr-2 text-icon-gray" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </>
      ) : (
        <Link to="/auth">
          <Button 
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2 text-icon-gray" />
            Admin Login
          </Button>
        </Link>
      )}
    </div>
  );
};

export default AuthSection;
