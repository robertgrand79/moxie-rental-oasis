/**
 * Global Colors Hook
 * 
 * This hook is the primary entry point for the site-wide color system.
 * It fetches color settings from the database and applies them as CSS
 * custom properties to the document root.
 * 
 * Usage:
 * Place this hook in a high-level component (like GlobalThemeProvider)
 * that renders on every page. The hook will automatically:
 * 1. Fetch color settings from the site_settings table
 * 2. Convert hex colors to HSL format
 * 3. Apply colors as CSS custom properties
 * 
 * @example
 * // In your layout or provider component:
 * const GlobalThemeProvider = ({ children }) => {
 *   useGlobalColors(); // Applies colors from database
 *   return <>{children}</>;
 * };
 * 
 * @module useGlobalColors
 */

import { useEffect } from 'react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { hexToHsl, DEFAULT_COLORS } from '@/lib/colorUtils';

/**
 * Hook that loads color settings from database and applies them as CSS custom properties.
 * 
 * The hook watches for changes in color settings and re-applies them automatically.
 * If no custom colors are configured, it skips applying any overrides, allowing
 * the default CSS values to remain in effect.
 * 
 * Color Tokens Applied:
 * - --primary: Main brand color
 * - --secondary: Secondary UI color
 * - --accent: Accent/highlight color
 * - --background: Page background
 * - --foreground: Default text color
 * - --muted: Muted/subtle backgrounds
 * - Plus derived tokens: card, popover, gradients, footer, etc.
 */
export const useGlobalColors = () => {
  const { settings, loading } = useSimplifiedSiteSettings();

  useEffect(() => {
    // Wait for settings to load
    if (loading) return;

    // Get colors from settings with fallbacks to defaults
    const primary = settings?.colorPrimary || DEFAULT_COLORS.primary;
    const secondary = settings?.colorSecondary || DEFAULT_COLORS.secondary;
    const accent = settings?.colorAccent || DEFAULT_COLORS.accent;
    const background = settings?.colorBackground || DEFAULT_COLORS.background;
    const foreground = settings?.colorForeground || DEFAULT_COLORS.foreground;
    const muted = settings?.colorMuted || DEFAULT_COLORS.muted;

    // Check if any custom colors are configured
    const hasCustomColors = settings?.colorPrimary || settings?.colorSecondary || 
                           settings?.colorAccent || settings?.colorBackground || 
                           settings?.colorForeground || settings?.colorMuted;
    
    // Skip if no custom colors - use CSS defaults from index.css
    if (!hasCustomColors) {
      console.log('🎨 [Colors] No custom colors configured, using CSS defaults');
      return;
    }

    console.log('🎨 [Colors] Applying colors from database:', {
      primary, secondary, accent, background, foreground, muted
    });

    try {
      const root = document.documentElement;

      // Convert hex to HSL for CSS custom properties
      const primaryHsl = hexToHsl(primary);
      const secondaryHsl = hexToHsl(secondary);
      const accentHsl = hexToHsl(accent);
      const backgroundHsl = hexToHsl(background);
      const foregroundHsl = hexToHsl(foreground);
      const mutedHsl = hexToHsl(muted);

      // Apply core color tokens
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--secondary', secondaryHsl);
      root.style.setProperty('--accent', accentHsl);
      root.style.setProperty('--background', backgroundHsl);
      root.style.setProperty('--foreground', foregroundHsl);
      root.style.setProperty('--muted', mutedHsl);

      // Apply derived colors for card and popover components
      root.style.setProperty('--card', backgroundHsl);
      root.style.setProperty('--card-foreground', foregroundHsl);
      root.style.setProperty('--popover', backgroundHsl);
      root.style.setProperty('--popover-foreground', foregroundHsl);

      // Apply gradient colors for hero sections and decorative elements
      root.style.setProperty('--gradient-from', primaryHsl);
      root.style.setProperty('--gradient-via', secondaryHsl);
      root.style.setProperty('--gradient-to', accentHsl);
      root.style.setProperty('--gradient-accent-from', secondaryHsl);
      root.style.setProperty('--gradient-accent-to', accentHsl);

      // Apply hero-specific gradient colors
      root.style.setProperty('--hero-gradient-from', primaryHsl);
      root.style.setProperty('--hero-gradient-to', secondaryHsl);

      // Apply footer background color
      root.style.setProperty('--footer-bg', primaryHsl);

      console.log('🎨 [Colors] CSS custom properties applied successfully');
    } catch (error) {
      console.error('🎨 [Colors] Error applying colors:', error);
    }

  }, [
    settings?.colorPrimary,
    settings?.colorSecondary,
    settings?.colorAccent,
    settings?.colorBackground,
    settings?.colorForeground,
    settings?.colorMuted,
    loading
  ]);
};

export default useGlobalColors;
