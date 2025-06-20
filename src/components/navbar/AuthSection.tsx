
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LogOut, Settings } from 'lucide-react';
import { shouldShowAdminFeatures } from '@/utils/domainUtils';

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
        // Only show Admin Login button on admin domain
        shouldShowAdminFeatures() && (
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
        )
      )}
    </div>
  );
};

export default AuthSection;
