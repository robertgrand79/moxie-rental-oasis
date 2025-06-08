
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems } from './navigationItems';
import { useAuth } from '@/contexts/AuthContext';

const DesktopNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Filter out Admin link if user is not authenticated
  const filteredItems = navigationItems.filter(item => 
    item.href !== '/admin' || user
  );

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
      case '/admin':
        return 'text-icon-gray';
      default:
        return 'text-icon-gray';
    }
  };

  return (
    <div className="hidden lg:flex items-center space-x-8">
      {filteredItems.map((item) => {
        const IconComponent = item.icon;
        const iconColor = getIconColor(item.href);
        return (
          <Link
            key={item.title}
            to={item.href}
            className="flex items-center space-x-2 font-medium text-sm transition-colors duration-200 group text-gray-700 hover:text-gray-900"
          >
            <IconComponent className={`h-4 w-4 group-hover:scale-110 transition-transform duration-200 ${iconColor}`} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default DesktopNavigation;
