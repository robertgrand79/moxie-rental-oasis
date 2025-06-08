
import {
  Home,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  Users,
  Zap,
  Image,
  MapPin,
  MessageSquare,
  Star,
  Mail,
  Wrench,
  CheckSquare,
  Kanban,
  ClipboardList
} from 'lucide-react';

export const coreMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
    color: 'text-blue-600',
  },
  {
    title: 'Task Management',
    url: '/admin/tasks',
    icon: Kanban,
    color: 'text-purple-600',
  },
  {
    title: 'Work Orders',
    url: '/admin/work-orders',
    icon: ClipboardList,
    color: 'text-orange-600',
  },
  {
    title: 'Properties',
    url: '/admin/properties',
    icon: Home,
    color: 'text-green-600',
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
    color: 'text-indigo-600',
  },
  {
    title: 'Site Metrics',
    url: '/admin/site-metrics',
    icon: Zap,
    color: 'text-yellow-600',
  },
];

export const contentMenuItems = [
  {
    title: 'Pages',
    url: '/admin/pages',
    icon: FileText,
    color: 'text-gray-600',
  },
  {
    title: 'Blog Posts',
    url: '/admin/blog-management',
    icon: FileText,
    color: 'text-orange-600',
  },
  {
    title: 'Events',
    url: '/admin/events',
    icon: Calendar,
    color: 'text-red-600',
  },
  {
    title: 'Lifestyle Gallery',
    url: '/admin/lifestyle',
    icon: Image,
    color: 'text-pink-600',
  },
  {
    title: 'Points of Interest',
    url: '/admin/poi',
    icon: MapPin,
    color: 'text-cyan-600',
  },
  {
    title: 'Testimonials',
    url: '/admin/testimonials',
    icon: MessageSquare,
    color: 'text-amber-600',
  },
  {
    title: 'Newsletter',
    url: '/admin/newsletter',
    icon: Mail,
    color: 'text-lime-600',
  },
];

export const toolsMenuItems = [
  {
    title: 'AI Tools',
    url: '/admin/ai-tools',
    icon: Wrench,
    color: 'text-violet-600',
  },
  {
    title: 'Site Settings',
    url: '/admin/site-settings',
    icon: Settings,
    color: 'text-teal-600',
  },
  {
    title: 'Sample Data',
    url: '/admin/sample-data',
    icon: CheckSquare,
    color: 'text-fuchsia-600',
  },
];
