
import {
  LayoutDashboard,
  Settings,
  Building,
  FileText,
  Calendar,
  MapPin,
  Camera,
  MessageSquare,
  Wand2,
  File,
} from 'lucide-react';

export const adminMenuItems = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Overview', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Content Management',
    items: [
      { title: 'AI Assistant', href: '/admin/ai-chat', icon: Wand2 },
      { title: 'Properties', href: '/admin/properties', icon: Building },
      { title: 'Blog Posts', href: '/admin/blog', icon: FileText },
      { title: 'Pages', href: '/admin/pages', icon: File },
      { title: 'Events', href: '/admin/events', icon: Calendar },
      { title: 'Points of Interest', href: '/admin/poi', icon: MapPin },
      { title: 'Lifestyle Gallery', href: '/admin/lifestyle', icon: Camera },
      { title: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    ]
  },
  {
    title: 'Settings',
    items: [
      { title: 'Site Settings', href: '/admin/settings', icon: Settings },
    ]
  }
];
