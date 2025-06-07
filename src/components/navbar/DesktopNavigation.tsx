
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems, adminNavigationItems } from './navigationItems';

interface DesktopNavigationProps {
  isAdminPage: boolean;
}

const DesktopNavigation = ({ isAdminPage }: DesktopNavigationProps) => {
  const location = useLocation();
  const items = isAdminPage ? adminNavigationItems : navigationItems;

  return (
    <div className="hidden lg:flex items-center space-x-8">
      {items.map((item) => {
        const IconComponent = item.icon;
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
            <IconComponent className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default DesktopNavigation;
