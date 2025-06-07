
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { navigationItems, adminNavigationItems } from './navigationItems';

interface MobileNavigationProps {
  isAdminPage: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const MobileNavigation = ({ 
  isAdminPage, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: MobileNavigationProps) => {
  const location = useLocation();
  const items = isAdminPage ? adminNavigationItems : navigationItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden p-2"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? 
          <X className="h-6 w-6 text-icon-gray" /> : 
          <Menu className="h-6 w-6 text-icon-gray" />
        }
      </Button>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100">
          <div className="py-4 space-y-1">
            {items.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isAdminPage && location.pathname === item.href 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <IconComponent className="h-5 w-5 text-icon-gray" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
