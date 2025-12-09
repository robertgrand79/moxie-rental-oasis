
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import MobileNavigationDrawer from './MobileNavigationDrawer';

interface MobileNavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const MobileNavigation = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: MobileNavigationProps) => {
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden p-2 min-h-[44px] min-w-[44px]"
        onClick={toggleMobileMenu}
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6 text-nav-foreground" />
      </Button>

      {/* Mobile Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />
    </>
  );
};

export default MobileNavigation;
