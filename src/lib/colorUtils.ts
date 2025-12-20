/**
 * Color Utility Functions
 * 
 * This module provides shared color conversion and validation utilities
 * for the site-wide color system. Colors flow from the database through
 * the useGlobalColors hook, which applies them as CSS custom properties.
 * 
 * Color System Architecture:
 * ┌─────────────────┐
 * │   Database      │  (site_settings table: colorPrimary, colorSecondary, etc.)
 * └────────┬────────┘
 *          │
 *          ▼
 * ┌─────────────────┐
 * │ useGlobalColors │  (Hook that fetches and applies colors)
 * └────────┬────────┘
 *          │
 *          ▼
 * ┌─────────────────┐
 * │ CSS Variables   │  (--primary, --secondary, --accent, etc.)
 * └────────┬────────┘
 *          │
 *          ▼
 * ┌─────────────────┐
 * │ Tailwind Classes│  (bg-primary, text-secondary, etc.)
 * └─────────────────┘
 * 
 * @module colorUtils
 */

/**
 * Default color palette used when no custom colors are configured.
 * These values serve as fallbacks throughout the color system.
 */
export const DEFAULT_COLORS = {
  primary: '#767b8d',
  secondary: '#8b929a',
  accent: '#cbcfd2',
  background: '#ffffff',
  foreground: '#1a202c',
  muted: '#ececec',
  destructive: '#ef4444',
} as const;

/**
 * Color palette interface for type safety across the color system.
 */
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  destructive?: string;
}

/**
 * Validates if a string is a valid hex color code.
 * 
 * @param hex - The string to validate
 * @returns True if the string is a valid 6-character hex color (e.g., #RRGGBB)
 * 
 * @example
 * isValidHexColor('#ff5500') // true
 * isValidHexColor('#fff')    // false (only 3-char shorthand)
 * isValidHexColor('red')     // false (named color)
 * isValidHexColor('')        // false
 */
export const isValidHexColor = (hex: string): boolean => {
  if (!hex || typeof hex !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
};

/**
 * Expands a 3-character hex shorthand to full 6-character format.
 * 
 * @param hex - The hex color to expand (e.g., '#f00')
 * @returns The expanded hex color (e.g., '#ff0000') or original if already 6-char
 * 
 * @example
 * expandShortHex('#f00') // '#ff0000'
 * expandShortHex('#ff0000') // '#ff0000'
 */
export const expandShortHex = (hex: string): string => {
  if (!hex || typeof hex !== 'string') return hex;
  
  // Match 3-character hex
  const shortMatch = hex.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
  if (shortMatch) {
    const [, r, g, b] = shortMatch;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  
  return hex;
};

/**
 * Converts a hex color string to HSL format for CSS custom properties.
 * 
 * This is the core conversion function used by the color system to transform
 * user-friendly hex colors into the HSL format required by Tailwind CSS
 * and shadcn/ui components.
 * 
 * @param hex - The hex color string (e.g., '#ff5500' or '#f50')
 * @returns HSL string in the format "H S% L%" (e.g., "20 100% 50%")
 *          Returns a neutral gray '0 0% 50%' for invalid inputs.
 * 
 * @example
 * hexToHsl('#ff0000') // '0 100% 50%'
 * hexToHsl('#ffffff') // '0 0% 100%'
 * hexToHsl('#767b8d') // '225 8% 51%'
 * hexToHsl('invalid') // '0 0% 50%' (fallback)
 */
export const hexToHsl = (hex: string): string => {
  // Handle null, undefined, or non-string values
  if (!hex || typeof hex !== 'string') {
    console.warn('[colorUtils] hexToHsl received invalid input:', hex);
    return '0 0% 50%';
  }

  // Expand 3-char shorthand to 6-char
  const expandedHex = expandShortHex(hex);

  // Validate hex format
  if (!expandedHex.startsWith('#') || expandedHex.length !== 7) {
    console.warn('[colorUtils] hexToHsl received invalid hex format:', hex);
    return '0 0% 50%';
  }

  try {
    // Parse RGB values
    const r = parseInt(expandedHex.slice(1, 3), 16) / 255;
    const g = parseInt(expandedHex.slice(3, 5), 16) / 255;
    const b = parseInt(expandedHex.slice(5, 7), 16) / 255;

    // Validate parsed values
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.warn('[colorUtils] Failed to parse hex color:', hex);
      return '0 0% 50%';
    }

    // Calculate HSL values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch (error) {
    console.error('[colorUtils] Error converting hex to HSL:', error);
    return '0 0% 50%';
  }
};

/**
 * Converts an HSL string back to hex format.
 * Useful for displaying current values in color pickers.
 * 
 * @param hsl - The HSL string in format "H S% L%" (e.g., "20 100% 50%")
 * @returns The hex color string (e.g., '#ff5500')
 * 
 * @example
 * hslToHex('0 100% 50%') // '#ff0000'
 * hslToHex('0 0% 100%')  // '#ffffff'
 */
export const hslToHex = (hsl: string): string => {
  try {
    const parts = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!parts) return '#808080';

    const h = parseInt(parts[1]) / 360;
    const s = parseInt(parts[2]) / 100;
    const l = parseInt(parts[3]) / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (x: number): string => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (error) {
    console.error('[colorUtils] Error converting HSL to hex:', error);
    return '#808080';
  }
};

/**
 * List of CSS custom properties that the color system manages.
 * Used for applying and resetting theme colors.
 */
export const COLOR_CSS_PROPERTIES = [
  // Core colors
  '--primary',
  '--secondary', 
  '--accent',
  '--background',
  '--foreground',
  '--muted',
  '--destructive',
  // Derived colors
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  // Gradient colors
  '--gradient-from',
  '--gradient-via',
  '--gradient-to',
  '--gradient-accent-from',
  '--gradient-accent-to',
  // Section-specific colors
  '--hero-gradient-from',
  '--hero-gradient-to',
  '--footer-bg',
] as const;

/**
 * Applies a color palette to the document's CSS custom properties.
 * This function is used by both useGlobalColors (on load) and 
 * ColorCustomizer (for live preview).
 * 
 * @param colors - The color palette to apply
 * 
 * @example
 * applyColorsToDOM({
 *   primary: '#ff5500',
 *   secondary: '#ff8800',
 *   accent: '#ffaa00',
 *   background: '#ffffff',
 *   text: '#1a202c',
 *   muted: '#f0f0f0'
 * });
 */
export const applyColorsToDOM = (colors: ColorPalette): void => {
  try {
    const root = document.documentElement;
    
    const primaryHsl = hexToHsl(colors.primary);
    const secondaryHsl = hexToHsl(colors.secondary);
    const accentHsl = hexToHsl(colors.accent);
    const backgroundHsl = hexToHsl(colors.background);
    const foregroundHsl = hexToHsl(colors.text);
    const mutedHsl = hexToHsl(colors.muted);
    const destructiveHsl = colors.destructive ? hexToHsl(colors.destructive) : null;

    // Apply core color tokens
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--background', backgroundHsl);
    root.style.setProperty('--foreground', foregroundHsl);
    root.style.setProperty('--muted', mutedHsl);
    if (destructiveHsl) {
      root.style.setProperty('--destructive', destructiveHsl);
    }

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

    // Apply section-specific colors
    root.style.setProperty('--hero-gradient-from', primaryHsl);
    root.style.setProperty('--hero-gradient-to', secondaryHsl);
    root.style.setProperty('--footer-bg', primaryHsl);
  } catch (error) {
    console.error('[colorUtils] Error applying colors to DOM:', error);
  }
};

/**
 * Removes all custom color overrides from the document.
 * Resets the theme to use the default CSS values defined in index.css.
 */
export const resetColorsInDOM = (): void => {
  try {
    const root = document.documentElement;
    COLOR_CSS_PROPERTIES.forEach(prop => root.style.removeProperty(prop));
  } catch (error) {
    console.error('[colorUtils] Error resetting colors:', error);
  }
};
