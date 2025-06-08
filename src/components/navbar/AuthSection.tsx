
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
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
    <div className="flex items-center space-x-3">
      {user ? (
        <>
          {!isAdminPage && (
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">{displayName}</span>
              </div>
            </div>
          )}
          
          {!isAdminPage && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <Link to="/admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </>
      ) : (
        <Button 
          variant="outline"
          size="sm"
          asChild
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          <Link to="/auth" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Admin Login
          </Link>
        </Button>
      )}
    </div>
  );
};

export default AuthSection;
