
import { 
  LayoutDashboard, 
  Building, 
  FileText, 
  PenTool, 
  User, 
  Calendar,
  MapPin,
  Camera,
  MessageSquare,
  Sparkles,
  Settings,
  Database,
  Mail,
  Activity
} from 'lucide-react';

export const coreMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Site Metrics',
    url: '/admin/site-metrics',
    icon: Activity
  }
];

export const contentMenuItems = [
  {
    title: 'Properties',
    url: '/admin/properties',
    icon: Building
  },
  {
    title: 'Blog Management',
    url: '/admin/blog-management',
    icon: PenTool
  },
  {
    title: 'Page Management',
    url: '/admin/page-management',
    icon: FileText
  },
  {
    title: 'Events',
    url: '/admin/events',
    icon: Calendar
  },
  {
    title: 'Points of Interest',
    url: '/admin/poi',
    icon: MapPin
  },
  {
    title: 'Lifestyle Gallery',
    url: '/admin/lifestyle',
    icon: Camera
  },
  {
    title: 'Testimonials',
    url: '/admin/testimonials',
    icon: MessageSquare
  },
  {
    title: 'Newsletter',
    url: '/admin/newsletter',
    icon: Mail
  }
];

export const toolsMenuItems = [
  {
    title: 'AI Tools',
    url: '/admin/ai-tools',
    icon: Sparkles
  },
  {
    title: 'Site Settings',
    url: '/admin/site-settings',
    icon: Settings
  },
  {
    title: 'Sample Data',
    url: '/admin/sample-data',
    icon: Database
  },
  {
    title: 'Profile',
    url: '/admin/profile',
    icon: User
  }
];
