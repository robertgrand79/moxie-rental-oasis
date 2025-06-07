
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { navigationItems, adminNavigationItems } from './navigationItems';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface MobileNavigationDrawerProps {
  isAdminPage: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigationDrawer = ({ 
  isAdminPage, 
  isOpen, 
  onClose 
}: MobileNavigationDrawerProps) => {
  const location = useLocation();
  const items = isAdminPage ? adminNavigationItems : navigationItems;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 bg-white">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-left text-xl font-bold text-gray-900">
            {isAdminPage ? 'Admin Menu' : 'Navigation'}
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col space-y-2">
          {items.map((item) => {
            const IconComponent = item.icon;
            const isActive = isAdminPage && location.pathname === item.href;
            
            return (
              <Link
                key={item.title}
                to={item.href}
                className={`flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50 border border-blue-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
                onClick={handleLinkClick}
              >
                <IconComponent className="h-6 w-6 text-icon-gray" />
                <span className="text-base">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigationDrawer;
