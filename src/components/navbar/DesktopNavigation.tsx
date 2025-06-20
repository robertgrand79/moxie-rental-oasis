
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems } from './navigationItems';
import { useAuth } from '@/contexts/AuthContext';
import { shouldShowAdminFeatures } from '@/utils/domainUtils';

const DesktopNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Filter navigation items based on domain and user authentication
  const filteredItems = navigationItems.filter(item => {
    // Hide admin link if not on admin domain
    if (item.href === '/admin' && !shouldShowAdminFeatures()) {
      return false;
    }
    // Hide admin link if user is not authenticated (on admin domain)
    if (item.href === '/admin' && !user) {
      return false;
    }
    return true;
  });

  return (
    <div className="hidden lg:flex items-center space-x-4">
      {filteredItems.map((item) => {
        const isActive = location.pathname === item.href;
        const IconComponent = item.icon;
        
        return (
          <Link
            key={item.title}
            to={item.href}
            className={`flex items-center space-x-1.5 font-medium text-sm transition-colors duration-200 hover:text-primary px-2.5 py-2 rounded-md ${
              isActive ? 'text-primary bg-primary/10' : 'text-gray-700'
            }`}
          >
            <IconComponent className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default DesktopNavigation;
