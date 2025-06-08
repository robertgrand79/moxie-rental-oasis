
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Settings } from 'lucide-react';
import { navigationItems } from './navigationItems';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigationDrawer = ({ 
  isOpen, 
  onClose 
}: MobileNavigationDrawerProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const getIconColor = (href: string) => {
    switch (href) {
      case '/':
        return 'text-icon-blue';
      case '/listings':
        return 'text-icon-emerald';
      case '/blog':
        return 'text-icon-purple';
      case '/about':
        return 'text-icon-amber';
      case '/experiences':
        return 'text-icon-teal';
      default:
        return 'text-icon-gray';
    }
  };

  const handleLinkClick = () => {
    onClose();
  };

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
      onClose();
    }
  };

  const handleAdminLogin = () => {
    navigate('/auth');
    onClose();
  };

  const handleAdminPanel = () => {
    navigate('/admin');
    onClose();
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 bg-white">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-left text-xl font-bold text-gray-900">
            Navigation
          </SheetTitle>
        </SheetHeader>
        
        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            const iconColor = getIconColor(item.href);
            
            return (
              <Link
                key={item.title}
                to={item.href}
                className={`flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50 border border-blue-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
                onClick={handleLinkClick}
              >
                <IconComponent className={`h-6 w-6 ${iconColor}`} />
                <span className="text-base">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Separator */}
        <Separator className="my-6" />

        {/* Authentication Section */}
        <div className="space-y-2">
          {user ? (
            <>
              {/* User Info */}
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                <User className="h-5 w-5 text-icon-gray mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {displayName}
                  </p>
                </div>
              </div>

              {/* Admin Panel Button */}
              <button
                onClick={handleAdminPanel}
                className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
              >
                <Shield className="h-6 w-6 text-icon-gray" />
                <span className="text-base">Admin Panel</span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
              >
                <LogOut className="h-6 w-6 text-icon-gray" />
                <span className="text-base">Sign Out</span>
              </button>
            </>
          ) : (
            /* Admin Login Button */
            <button
              onClick={handleAdminLogin}
              className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
            >
              <Settings className="h-6 w-6 text-icon-gray" />
              <span className="text-base">Admin Login</span>
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigationDrawer;
