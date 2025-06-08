
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
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
  Building2,
  LogOut,
  ArrowLeft
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
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.'
      });
      navigate('/');
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  const coreMenuItems = [
    {
      title: 'Back to Site',
      href: '/',
      icon: ArrowLeft,
      color: 'text-icon-gray'
    },
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
          <h2 className="text-xl font-bold text-gray-900">Moxie Command</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderMenuSection('Navigation', coreMenuItems)}
        {renderMenuSection('Content Management', contentMenuItems)}
        {renderMenuSection('Tools & Settings', toolsMenuItems)}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg flex-1">
              <User className="h-4 w-4 text-icon-gray mr-2" />
              <span className="text-sm font-medium text-gray-700 truncate">{displayName}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4 mr-2 text-icon-gray" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
