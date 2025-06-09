
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
    <div className="hidden lg:flex items-center space-x-8">
      {filteredItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.title}
            to={item.href}
            className={`font-medium text-sm transition-colors duration-200 hover:text-primary ${
              isActive ? 'text-primary' : 'text-gray-700'
            }`}
          >
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default DesktopNavigation;
