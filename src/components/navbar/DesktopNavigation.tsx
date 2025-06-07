
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems, adminNavigationItems } from './navigationItems';

interface DesktopNavigationProps {
  isAdminPage: boolean;
}

const DesktopNavigation = ({ isAdminPage }: DesktopNavigationProps) => {
  const location = useLocation();
  const items = isAdminPage ? adminNavigationItems : navigationItems;

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
      // Admin colors
      case '/admin':
        return 'text-icon-blue';
      case '/properties':
        return 'text-icon-emerald';
      case '/page-management':
        return 'text-icon-orange';
      case '/blog-management':
        return 'text-icon-purple';
      case '/admin/analytics':
        return 'text-icon-indigo';
      case '/admin/chat-support':
        return 'text-icon-rose';
      case '/admin/profile':
        return 'text-icon-gray';
      case '/site-settings':
        return 'text-icon-gray';
      default:
        return 'text-icon-gray';
    }
  };

  return (
    <div className="hidden lg:flex items-center space-x-8">
      {items.map((item) => {
        const IconComponent = item.icon;
        const iconColor = getIconColor(item.href);
        return (
          <Link
            key={item.title}
            to={item.href}
            className={`flex items-center space-x-2 font-medium text-sm transition-colors duration-200 group ${
              isAdminPage && location.pathname === item.href 
                ? 'text-blue-600' 
                : 'text-gray-700 hover:text-gray-900'
            }`}
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
