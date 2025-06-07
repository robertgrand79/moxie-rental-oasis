
import { Home, Building2, BookOpen, Info, MapPin, Settings } from 'lucide-react';

export const navigationItems = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'Listings', href: '/listings', icon: Building2 },
  { title: 'Blog', href: '/blog', icon: BookOpen },
  { title: 'About', href: '/about', icon: Info },
  { title: 'Local Favorites', href: '/experiences', icon: MapPin },
];

export const adminNavigationItems = [
  { title: 'Dashboard', href: '/admin', icon: Home },
  { title: 'Properties', href: '/properties', icon: Building2 },
  { title: 'Content Studio', href: '/blog-management', icon: BookOpen },
  { title: 'Brand Studio', href: '/site-settings', icon: Settings },
];
