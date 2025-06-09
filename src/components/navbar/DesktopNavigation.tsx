
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
