
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LogoSection from './navbar/LogoSection';
import DesktopNavigation from './navbar/DesktopNavigation';
import AuthSection from './navbar/AuthSection';
import MobileNavigation from './navbar/MobileNavigation';

const NavBar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = isHomePage 
    ? `fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-transparent'
      }`
    : 'bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <LogoSection />
          </div>
          
          <div className="hidden lg:block">
            <DesktopNavigation />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <AuthSection />
            </div>
            
            <div className="lg:hidden">
              <MobileNavigation 
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
