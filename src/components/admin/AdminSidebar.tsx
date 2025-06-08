
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
  Database
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
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
      title: 'Chat Support',
      href: '/admin/chat-support',
      icon: MessageSquare,
      color: 'text-icon-rose'
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
      title: 'Profile',
      href: '/admin/profile',
      icon: User,
      color: 'text-icon-gray'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-16 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200",
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
    </div>
  );
};

export default AdminSidebar;
