
import { Home, Building2, BookOpen, Search, Info, MapPin, FileText, Settings, User, Shield, BarChart3, MessageSquare } from 'lucide-react';

export const navigationItems = [
  { title: 'Home', href: '/', icon: Home },
  { title: 'Listings', href: '/listings', icon: Building2 },
  { title: 'Blog', href: '/blog', icon: BookOpen },
  { title: 'About', href: '/about', icon: Info },
  { title: 'Experiences', href: '/experiences', icon: MapPin },
];

export const adminNavigationItems = [
  { title: 'Dashboard', href: '/admin', icon: Shield },
  { title: 'Properties', href: '/properties', icon: Building2 },
  { title: 'Pages', href: '/page-management', icon: FileText },
  { title: 'Blog', href: '/blog-management', icon: BookOpen },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Chat Support', href: '/admin/chat-support', icon: MessageSquare },
  { title: 'Profile', href: '/admin/profile', icon: User },
  { title: 'Settings', href: '/site-settings', icon: Settings },
];
