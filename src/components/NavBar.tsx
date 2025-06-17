
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoSection from './navbar/LogoSection';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileNavigation from './navbar/MobileNavigation';
import AuthSection from './navbar/AuthSection';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <LogoSection />
          <DesktopNavigation />
          <AuthSection />
          <MobileNavigation 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
