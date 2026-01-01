import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { navigationItems } from './navigationItems';
import { useAuth } from '@/contexts/AuthContext';
import { shouldShowAdminFeatures } from '@/utils/domainUtils';
import { useTenant } from '@/contexts/TenantContext';
import { useNavigationConfig } from '@/hooks/useNavigationConfig';

// Map of core nav IDs to their icons
const coreNavMap = new Map(
  navigationItems
    .filter(item => item.href !== '/admin')
    .map(item => [item.name.toLowerCase(), item])
);

const DesktopNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isSingleProperty } = useTenant();
  const { config, isLoading } = useNavigationConfig();

  // Build the navigation items from config
  const getNavigationItems = () => {
    if (!config?.items) {
      // Fallback to default navigation
      return navigationItems
        .filter(item => {
          if (item.href === '/admin' && (!shouldShowAdminFeatures() || !user)) return false;
          if ((item.href === '/properties' || item.href === '/listings') && isSingleProperty) return false;
          return true;
        })
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

  // Add admin link if applicable
  const getAdminLink = () => {
    if (shouldShowAdminFeatures() && user) {
      const adminItem = navigationItems.find(item => item.href === '/admin');
      if (adminItem) {
        return {
          key: 'admin',
          href: adminItem.href,
          title: adminItem.title,
          icon: adminItem.icon,
        };
      }
    }
    return null;
  };

  const navItems = getNavigationItems();
  const adminLink = getAdminLink();

  if (isLoading) {
    return (
      <div className="hidden lg:flex items-center space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-20 bg-muted/50 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center space-x-4">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const IconComponent = item.icon;
        
        return (
          <Link
            key={item.key}
            to={item.href}
            className={`flex items-center space-x-1.5 font-medium text-sm transition-colors duration-200 hover:text-nav-hover px-2.5 py-2 rounded-md ${
              isActive ? 'text-primary bg-primary/10' : 'text-nav-foreground'
            }`}
          >
            <IconComponent className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
      
      {adminLink && (
        <Link
          to={adminLink.href}
          className={`flex items-center space-x-1.5 font-medium text-sm transition-colors duration-200 hover:text-nav-hover px-2.5 py-2 rounded-md ${
            location.pathname === adminLink.href ? 'text-primary bg-primary/10' : 'text-nav-foreground'
          }`}
        >
          <adminLink.icon className="h-5 w-5" />
          <span>{adminLink.title}</span>
        </Link>
      )}
    </div>
  );
};

export default DesktopNavigation;
