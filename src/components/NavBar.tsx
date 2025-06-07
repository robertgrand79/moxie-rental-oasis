
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LogoSection from './navbar/LogoSection';
import DesktopNavigation from './navbar/DesktopNavigation';
import AuthSection from './navbar/AuthSection';
import MobileNavigation from './navbar/MobileNavigation';

const NavBar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdminPage = location.pathname.startsWith('/admin') || 
                     location.pathname.startsWith('/properties') || 
                     location.pathname.startsWith('/blog-management') || 
                     location.pathname.startsWith('/page-management') || 
                     location.pathname.startsWith('/site-settings');

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
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-transparent'
      }`
    : 'bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <LogoSection isAdminPage={isAdminPage} />
          <DesktopNavigation isAdminPage={isAdminPage} />
          
          <div className="flex items-center space-x-4">
            <AuthSection />
            <MobileNavigation 
              isAdminPage={isAdminPage}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
