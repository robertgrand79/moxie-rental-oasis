
import { 
  Home, 
  Building2, 
  Info, 
  Calendar, 
  BookOpen,
  Settings,
  BarChart3,
  MessageSquare,
  FileCheck,
  User,
  Edit3
} from 'lucide-react';

export const navigationItems = [
  { name: 'Home', href: '/', title: 'Home', icon: Home },
  { name: 'Properties', href: '/listings', title: 'Properties', icon: Building2 },
  { name: 'About', href: '/about', title: 'About', icon: Info },
  { name: 'Experiences', href: '/experiences', title: 'Experiences', icon: Calendar },
  { name: 'Events', href: '/events', title: 'Events', icon: Calendar },
  { name: 'Blog', href: '/blog', title: 'Blog', icon: BookOpen },
];

export const adminNavigationItems = [
  { title: 'Dashboard', href: '/admin', icon: Home },
  { title: 'Properties', href: '/properties', icon: Building2 },
  { title: 'Page Management', href: '/page-management', icon: Edit3 },
  { title: 'Blog Management', href: '/blog-management', icon: BookOpen },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Chat Support', href: '/admin/chat-support', icon: MessageSquare },
  { title: 'Profile', href: '/admin/profile', icon: User },
  { title: 'Settings', href: '/site-settings', icon: Settings },
];
