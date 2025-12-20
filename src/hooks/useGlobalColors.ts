import { useEffect } from 'react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

/**
 * Convert hex color to HSL string for CSS custom properties
 */
const hexToHsl = (hex: string): string => {
  // Handle invalid hex
  if (!hex || !hex.startsWith('#') || hex.length < 7) {
    return '0 0% 50%';
  }

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

/**
 * Hook that loads color settings from database and applies them as CSS custom properties
 */
export const useGlobalColors = () => {
  const { settings, loading } = useSimplifiedSiteSettings();

  useEffect(() => {
    if (loading) return;

    // Get colors from settings or use defaults
    const primary = settings?.colorPrimary || '#767b8d';
    const secondary = settings?.colorSecondary || '#8b929a';
    const accent = settings?.colorAccent || '#cbcfd2';
    const background = settings?.colorBackground || '#ffffff';
    const foreground = settings?.colorForeground || '#1a202c';
    const muted = settings?.colorMuted || '#ececec';

    // Skip if no colors are configured (all defaults)
    const hasCustomColors = settings?.colorPrimary || settings?.colorSecondary || 
                           settings?.colorAccent || settings?.colorBackground || 
                           settings?.colorForeground || settings?.colorMuted;
    
    if (!hasCustomColors) {
      console.log('🎨 [Colors] No custom colors configured, using CSS defaults');
      return;
    }

    console.log('🎨 [Colors] Applying colors from database:', {
      primary, secondary, accent, background, foreground, muted
    });

    const root = document.documentElement;

    // Convert and apply primary colors
    const primaryHsl = hexToHsl(primary);
    const secondaryHsl = hexToHsl(secondary);
    const accentHsl = hexToHsl(accent);
    const backgroundHsl = hexToHsl(background);
    const foregroundHsl = hexToHsl(foreground);
    const mutedHsl = hexToHsl(muted);

    // Apply main color tokens
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--background', backgroundHsl);
    root.style.setProperty('--foreground', foregroundHsl);
    root.style.setProperty('--muted', mutedHsl);

    // Apply derived colors for consistency
    root.style.setProperty('--card', backgroundHsl);
    root.style.setProperty('--card-foreground', foregroundHsl);
    root.style.setProperty('--popover', backgroundHsl);
    root.style.setProperty('--popover-foreground', foregroundHsl);

    // Apply gradient colors
    root.style.setProperty('--gradient-from', primaryHsl);
    root.style.setProperty('--gradient-via', secondaryHsl);
    root.style.setProperty('--gradient-to', accentHsl);
    root.style.setProperty('--gradient-accent-from', secondaryHsl);
    root.style.setProperty('--gradient-accent-to', accentHsl);

    // Apply hero colors
    root.style.setProperty('--hero-gradient-from', primaryHsl);
    root.style.setProperty('--hero-gradient-to', secondaryHsl);

    // Apply footer colors
    root.style.setProperty('--footer-bg', primaryHsl);

    console.log('🎨 [Colors] CSS custom properties applied successfully');

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
