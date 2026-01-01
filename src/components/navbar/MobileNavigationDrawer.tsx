import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Settings, FileText } from 'lucide-react';
import { navigationItems } from './navigationItems';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { shouldShowAdminFeatures } from '@/utils/domainUtils';
import { useNavigationConfig } from '@/hooks/useNavigationConfig';
import { useTenant } from '@/contexts/TenantContext';
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

// Map of core nav IDs to their data
const coreNavMap = new Map(
  navigationItems
    .filter(item => item.href !== '/admin')
    .map(item => [item.name.toLowerCase(), item])
);

const MobileNavigationDrawer = ({ 
  isOpen, 
  onClose 
}: MobileNavigationDrawerProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSingleProperty } = useTenant();
  const { config, isLoading } = useNavigationConfig();

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

  // Build the navigation items from config
  const getNavigationItems = () => {
    if (!config?.items) {
      // Fallback to default navigation (excluding admin)
      return navigationItems
        .filter(item => item.href !== '/admin')
        .map(item => ({
          key: item.name,
          href: item.href,
          title: item.title,
          icon: item.icon,
        }));
    }

    // Use configured items
    return config.items
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order)
      .map(item => {
        if (item.type === 'core') {
          const coreItem = coreNavMap.get(item.id);
          if (!coreItem) return null;
          
          // Apply filters
          if ((coreItem.href === '/properties' || coreItem.href === '/listings') && isSingleProperty) {
            return null;
          }

          return {
            key: item.id,
            href: coreItem.href,
            title: item.customLabel || coreItem.title,
            icon: coreItem.icon,
          };
        } else {
          // Custom page
          return {
            key: item.id,
            href: `/${item.slug}`,
            title: item.customLabel || item.originalTitle || item.slug,
            icon: FileText,
          };
        }
      })
      .filter(Boolean) as Array<{ key: string; href: string; title: string; icon: React.ElementType }>;
  };

  const navItems = getNavigationItems();

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
          {isLoading ? (
            // Loading skeleton
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
            ))
          ) : (
            navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`flex items-center px-4 py-4 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'text-primary bg-primary/10 border border-primary/20' 
                      : 'text-foreground hover:text-foreground hover:bg-accent border border-transparent'
                  }`}
                  onClick={handleLinkClick}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="text-base">{item.title}</span>
                </Link>
              );
            })
          )}
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
