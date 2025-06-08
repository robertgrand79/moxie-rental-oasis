
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
  Settings
} from 'lucide-react';

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
      href: '/admin/settings',
      icon: Settings,
      color: 'text-icon-gray'
    }
  ];

  const renderMenuSection = (title: string, items: typeof coreMenuItems) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 mx-2",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <IconComponent className={cn("h-5 w-5", item.color)} />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-16 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Panel</h2>
        
        {renderMenuSection('Core', coreMenuItems)}
        {renderMenuSection('Content Management', contentMenuItems)}
        {renderMenuSection('Tools & Settings', toolsMenuItems)}
      </div>
    </div>
  );
};

export default AdminSidebar;
