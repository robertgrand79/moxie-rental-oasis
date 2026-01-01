export interface NavigationItemConfig {
  id: string;
  type: 'core' | 'custom';
  enabled: boolean;
  order: number;
  customLabel?: string;
  // For custom pages
  slug?: string;
  originalTitle?: string;
}

export interface NavigationConfig {
  items: NavigationItemConfig[];
}

// Core navigation item IDs (must match navigationItems.ts)
export const CORE_NAV_IDS = ['home', 'properties', 'about', 'explore', 'events', 'blog', 'contact'] as const;
export type CoreNavId = typeof CORE_NAV_IDS[number];
