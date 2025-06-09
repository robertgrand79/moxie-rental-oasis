import {
  BarChart3,
  Building,
  Calendar,
  Camera,
  File,
  FileText,
  Gauge,
  Key,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  MessageSquare,
  Settings,
  User,
  Users,
  Wand2,
  Bot,
} from 'lucide-react';

export const adminMenuItems = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
      { title: 'Settings', href: '/admin/settings', icon: 'Settings' }
    ]
  },
  {
    title: 'Property Management',
    items: [
      { title: 'Properties', href: '/admin/properties', icon: 'Building' },
      { title: 'Bookings', href: '/admin/bookings', icon: 'Calendar' },
      { title: 'Reviews', href: '/admin/reviews', icon: 'MessageSquare' }
    ]
  },
  {
    title: 'User Management',
    items: [
      { title: 'Users', href: '/admin/users', icon: 'Users' },
      { title: 'Roles & Permissions', href: '/admin/roles', icon: 'Key' }
    ]
  },
  {
    title: 'Analytics & Reporting',
    items: [
      { title: 'Dashboard', href: '/admin/analytics', icon: 'BarChart3' },
      { title: 'Performance', href: '/admin/performance', icon: 'Gauge' },
      { title: 'Reports', href: '/admin/reports', icon: 'ListChecks' }
    ]
  },
  {
    title: 'Content Management',
    items: [
      { title: 'AI Assistant', href: '/admin/ai-chat', icon: 'Wand2' },
      { title: 'AI Tools (Legacy)', href: '/admin/ai-tools', icon: 'Bot' },
      { title: 'Blog Posts', href: '/admin/blog', icon: 'FileText' },
      { title: 'Pages', href: '/admin/pages', icon: 'File' },
      { title: 'Newsletter', href: '/admin/newsletter', icon: 'Mail' },
      { title: 'Events', href: '/admin/events', icon: 'Calendar' },
      { title: 'Points of Interest', href: '/admin/poi', icon: 'MapPin' },
      { title: 'Lifestyle Gallery', href: '/admin/lifestyle', icon: 'Camera' },
      { title: 'Testimonials', href: '/admin/testimonials', icon: 'MessageSquare' }
    ]
  },
  {
    title: 'Account',
    items: [
      { title: 'Profile', href: '/admin/profile', icon: 'User' },
      { title: 'Settings', href: '/admin/account-settings', icon: 'Settings' }
    ]
  }
];
