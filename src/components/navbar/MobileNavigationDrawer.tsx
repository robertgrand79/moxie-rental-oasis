import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Settings, FileText } from 'lucide-react';
import { navigationItems } from './navigationItems';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { shouldShowAdminFeatures } from '@/utils/domainUtils';
import { useNavigationPages } from '@/hooks/useNavigationPages';
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
  const { data: customPages = [] } = useNavigationPages();

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

  // Filter navigation items based on domain
  const filteredNavItems = navigationItems.filter(item => {
    // Hide admin navigation if not on admin domain
    if (item.href === '/admin' && !shouldShowAdminFeatures()) {
      return false;
    }
    return true;
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 bg-background">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-left text-xl font-bold text-foreground">
            Navigation
          </SheetTitle>
        </SheetHeader>
        
        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.title}
                to={item.href}
                className={`flex items-center px-4 py-4 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-primary bg-primary/10 border border-primary/20' 
                    : 'text-foreground hover:text-foreground hover:bg-accent border border-transparent'
                }`}
                onClick={handleLinkClick}
              >
                <span className="text-base">{item.title}</span>
              </Link>
            );
          })}
          
          {/* Custom pages from CMS */}
          {customPages.map((page) => {
            const isActive = location.pathname === `/${page.slug}`;
            
            return (
              <Link
                key={page.id}
                to={`/${page.slug}`}
                className={`flex items-center px-4 py-4 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-primary bg-primary/10 border border-primary/20' 
                    : 'text-foreground hover:text-foreground hover:bg-accent border border-transparent'
                }`}
                onClick={handleLinkClick}
              >
                <FileText className="h-5 w-5 mr-3" />
                <span className="text-base">{page.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Separator */}
        <Separator className="my-6" />

        {/* Authentication Section - Only show admin features on admin domain */}
        <div className="space-y-2">
          {user ? (
            <>
              {/* User Info */}
              <div className="flex items-center px-4 py-3 bg-muted rounded-xl">
                <User className="h-5 w-5 text-muted-foreground mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {displayName}
                  </p>
                </div>
              </div>

              {/* Admin Panel Button - Only on admin domain */}
              {shouldShowAdminFeatures() && (
                <button
                  onClick={handleAdminPanel}
                  className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 text-foreground hover:text-foreground hover:bg-accent border border-transparent"
                >
                  <Shield className="h-6 w-6 text-muted-foreground" />
                  <span className="text-base">Admin Panel</span>
                </button>
              )}

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 text-foreground hover:text-foreground hover:bg-accent border border-transparent"
              >
                <LogOut className="h-6 w-6 text-muted-foreground" />
                <span className="text-base">Sign Out</span>
              </button>
            </>
          ) : (
            /* Admin Login Button - Only on admin domain */
            shouldShowAdminFeatures() && (
              <button
                onClick={handleAdminLogin}
                className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 text-foreground hover:text-foreground hover:bg-accent border border-transparent"
              >
                <Settings className="h-6 w-6 text-muted-foreground" />
                <span className="text-base">Admin Login</span>
              </button>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigationDrawer;
