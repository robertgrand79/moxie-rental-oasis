import React from 'react';
import { useGlobalFonts } from '@/hooks/useGlobalFonts';

/**
 * Component that applies global font settings from site_settings
 * Must be placed inside providers that give access to settings
 */
const GlobalFontsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useGlobalFonts();
  return <>{children}</>;
};

export default GlobalFontsProvider;
