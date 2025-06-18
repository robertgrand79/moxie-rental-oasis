
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Building,
  Calendar,
  Settings,
  FileText,
  Users,
  Star,
  MapPin,
  Image,
  Wrench,
  Mail,
  BarChart3,
  BookOpen,
  MessageCircle
} from 'lucide-react';

const publicNavItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Properties', href: '/properties', icon: Building },
  { name: 'Eugene Life', href: '/eugene-life', icon: MapPin },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'Contact', href: '/contact', icon: MessageCircle },
];

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Properties', href: '/admin/properties', icon: Building },
  { name: 'Work Orders', href: '/admin/workorders', icon: Wrench },
  { name: 'Contractors', href: '/admin/contractors', icon: Users },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Eugene Events', href: '/admin/eugene-events', icon: Calendar },
  { name: 'Lifestyle Gallery', href: '/admin/lifestyle-gallery', icon: Image },
  { name: 'Points of Interest', href: '/admin/points-of-interest', icon: MapPin },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { name: 'Pages', href: '/admin/pages', icon: FileText },
  { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { name: 'Blog Posts', href: '/admin/blog-posts', icon: BookOpen },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface NavigationProps {
  isAdmin?: boolean;
}

const Navigation = ({ isAdmin = false }: NavigationProps) => {
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : publicNavItems;

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href || 
          (item.href !== '/' && location.pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
