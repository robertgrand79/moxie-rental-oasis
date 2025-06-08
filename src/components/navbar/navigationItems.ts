
import { 
  Home, 
  Building2, 
  Info, 
  Calendar, 
  BookOpen,
  Settings,
  Shield,
  ArrowLeft
} from 'lucide-react';

export const navigationItems = [
  { name: 'Home', href: '/', title: 'Home', icon: Home },
  { name: 'Properties', href: '/properties', title: 'Properties', icon: Building2 },
  { name: 'About', href: '/about', title: 'About', icon: Info },
  { name: 'Experiences', href: '/experiences', title: 'Experiences', icon: Calendar },
  { name: 'Events', href: '/events', title: 'Events', icon: Calendar },
  { name: 'Blog', href: '/blog', title: 'Blog', icon: BookOpen },
  { name: 'Admin', href: '/admin', title: 'Admin', icon: Shield },
];

export const adminNavigationItems = [
  { title: 'Back to Site', href: '/', icon: ArrowLeft },
];
