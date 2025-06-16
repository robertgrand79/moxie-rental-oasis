
import React from 'react';
import { Link } from 'react-router-dom';
import LogoSection from './navbar/LogoSection';
import DesktopNavigation from './navbar/DesktopNavigation';
import MobileNavigation from './navbar/MobileNavigation';
import AuthSection from './navbar/AuthSection';
import { useAuth } from '@/contexts/AuthContext';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { useStaticSettings } from '@/contexts/StaticSettingsContext';

const NavBar = () => {
  const { user } = useAuth();
  const staticSettings = useStaticSettings();
  const { settings, loading } = useStableSiteSettings();

  // Use static settings for non-authenticated users (published site)
  // Use dynamic settings for authenticated users (admin editing)
  const currentSettings = user && !loading ? settings : staticSettings;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <LogoSection siteName={currentSettings.siteName} />
          <DesktopNavigation />
          <AuthSection />
          <MobileNavigation />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
