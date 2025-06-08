
import { 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  FileText, 
  Calendar, 
  MapPin, 
  Camera, 
  Star, 
  Mail, 
  Settings, 
  BarChart3, 
  Bot,
  TrendingUp,
  ClipboardList,
  Wrench
} from 'lucide-react';

export const coreMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    isActive: false
  }
];

export const contentMenuItems = [
  {
    title: 'Properties',
    url: '/admin/properties',
    icon: Building2,
    isActive: false
  },
  {
    title: 'Blog Posts',
    url: '/admin/blog-management',
    icon: BookOpen,
    isActive: false
  },
  {
    title: 'Pages',
    url: '/admin/page-management',
    icon: FileText,
    isActive: false
  },
  {
    title: 'Events',
    url: '/admin/events',
    icon: Calendar,
    isActive: false
  },
  {
    title: 'Points of Interest',
    url: '/admin/poi',
    icon: MapPin,
    isActive: false
  },
  {
    title: 'Lifestyle Gallery',
    url: '/admin/lifestyle',
    icon: Camera,
    isActive: false
  },
  {
    title: 'Testimonials',
    url: '/admin/testimonials',
    icon: Star,
    isActive: false
  },
  {
    title: 'Newsletter',
    url: '/admin/newsletter',
    icon: Mail,
    isActive: false
  }
];

export const toolsMenuItems = [
  {
    title: 'Site Settings',
    url: '/admin/settings',
    icon: Settings,
    isActive: false
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
    isActive: false
  },
  {
    title: 'AI Tools',
    url: '/admin/ai-tools',
    icon: Bot,
    isActive: false
  },
  {
    title: 'Site Metrics',
    url: '/admin/site-metrics',
    icon: TrendingUp,
    isActive: false
  },
  {
    title: 'Task Management',
    url: '/admin/tasks',
    icon: ClipboardList,
    isActive: false
  },
  {
    title: 'Work Orders',
    url: '/admin/work-orders',
    icon: Wrench,
    isActive: false
  }
];
