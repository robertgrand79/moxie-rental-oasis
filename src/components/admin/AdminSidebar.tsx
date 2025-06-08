
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  CheckSquare,
  User,
  Calendar,
  MapPin,
  Camera,
  Star,
  Brain,
  Database,
  Settings,
  Building2
} from 'lucide-react';
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

const AdminSidebar = () => {
  const location = useLocation();

  const coreMenuItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      color: 'text-icon-blue'
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'text-icon-indigo'
    },
    {
      title: 'Profile',
      href: '/admin/profile',
      icon: User,
      color: 'text-icon-gray'
    }
  ];

  const contentMenuItems = [
    {
      title: 'Properties',
      href: '/properties',
      icon: Building2,
      color: 'text-icon-emerald'
    },
    {
      title: 'Content Approval',
      href: '/admin/content-approval',
      icon: CheckSquare,
      color: 'text-icon-emerald'
    },
    {
      title: 'Events',
      href: '/admin/events',
      icon: Calendar,
      color: 'text-icon-purple'
    },
    {
      title: 'Points of Interest',
      href: '/admin/poi',
      icon: MapPin,
      color: 'text-icon-amber'
    },
    {
      title: 'Lifestyle Gallery',
      href: '/admin/lifestyle',
      icon: Camera,
      color: 'text-icon-teal'
    },
    {
      title: 'Testimonials',
      href: '/admin/testimonials',
      icon: Star,
      color: 'text-icon-orange'
    }
  ];

  const toolsMenuItems = [
    {
      title: 'Chat Support',
      href: '/admin/chat-support',
      icon: MessageSquare,
      color: 'text-icon-rose'
    },
    {
      title: 'AI Tools',
      href: '/admin/ai-tools',
      icon: Brain,
      color: 'text-icon-violet'
    },
    {
      title: 'Sample Data',
      href: '/admin/sample-data',
      icon: Database,
      color: 'text-icon-slate'
    },
    {
      title: 'Settings',
      href: '/site-settings',
      icon: Settings,
      color: 'text-icon-gray'
    }
  ];

  const renderMenuSection = (title: string, items: typeof coreMenuItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link to={item.href} className="flex items-center space-x-3">
                    <IconComponent className={cn("h-5 w-5", item.color)} />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderMenuSection('Core', coreMenuItems)}
        {renderMenuSection('Content Management', contentMenuItems)}
        {renderMenuSection('Tools & Settings', toolsMenuItems)}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
