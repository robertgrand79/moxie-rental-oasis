
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  Home, 
  Building2, 
  FileText, 
  BookOpen, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  User,
  Calendar,
  MapPin,
  Camera,
  Star,
  Wand2
} from 'lucide-react';

const mainMenuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
];

const contentMenuItems = [
  {
    title: 'Properties',
    href: '/properties',
    icon: Building2,
  },
  {
    title: 'Page Management',
    href: '/page-management',
    icon: FileText,
  },
  {
    title: 'Blog Management',
    href: '/blog-management',
    icon: BookOpen,
  },
];

const featuresMenuItems = [
  {
    title: 'Events',
    href: '/admin/events',
    icon: Calendar,
  },
  {
    title: 'Points of Interest',
    href: '/admin/poi',
    icon: MapPin,
  },
  {
    title: 'Lifestyle Gallery',
    href: '/admin/lifestyle',
    icon: Camera,
  },
  {
    title: 'Testimonials',
    href: '/admin/testimonials',
    icon: Star,
  },
];

const toolsMenuItems = [
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Chat Support',
    href: '/admin/chat-support',
    icon: MessageSquare,
  },
  {
    title: 'AI Tools',
    href: '/admin/ai-tools',
    icon: Wand2,
  },
];

const settingsMenuItems = [
  {
    title: 'Site Settings',
    href: '/site-settings',
    icon: Settings,
  },
  {
    title: 'Profile',
    href: '/admin/profile',
    icon: User,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const renderMenuGroup = (items: any[], label: string) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-gray-500 font-medium">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)}>
                <Link to={item.href} className="flex items-center">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className="border-r border-white/20">
      <SidebarHeader className="p-6">
        <Link to="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">Moxie Vacation Rentals</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {renderMenuGroup(mainMenuItems, 'Overview')}
        {renderMenuGroup(contentMenuItems, 'Content Management')}
        {renderMenuGroup(featuresMenuItems, 'Features')}
        {renderMenuGroup(toolsMenuItems, 'Tools & Analytics')}
        {renderMenuGroup(settingsMenuItems, 'Settings')}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-gray-500 text-center">
          Admin Panel v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
