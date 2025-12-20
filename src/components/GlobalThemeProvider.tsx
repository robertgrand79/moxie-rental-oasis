import React from 'react';
import { useGlobalFonts } from '@/hooks/useGlobalFonts';
import { useGlobalColors } from '@/hooks/useGlobalColors';

/**
 * Component that applies global theme settings (fonts + colors) from site_settings
 * Must be placed inside providers that give access to settings
 */
const GlobalThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useGlobalFonts();
  useGlobalColors();
  return <>{children}</>;
};

export default GlobalThemeProvider;
