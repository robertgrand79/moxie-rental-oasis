
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
  Activity,
  Globe
} from 'lucide-react';

export const coreMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    color: 'text-blue-600'
  },
  {
    title: 'Site Metrics',
    url: '/admin/analytics',
    icon: Activity,
    color: 'text-green-600'
  }
];

export const contentMenuItems = [
  {
    title: 'Properties',
    url: '/admin/properties',
    icon: Building,
    color: 'text-purple-600'
  },
  {
    title: 'Blog Management',
    url: '/admin/blog-management',
    icon: PenTool,
    color: 'text-blue-600'
  },
  {
    title: 'Page Management',
    url: '/admin/page-management',
    icon: FileText,
    color: 'text-gray-600'
  },
  {
    title: 'Events',
    url: '/admin/events',
    icon: Calendar,
    color: 'text-orange-600'
  },
  {
    title: 'Points of Interest',
    url: '/admin/poi',
    icon: MapPin,
    color: 'text-red-600'
  },
  {
    title: 'Lifestyle Gallery',
    url: '/admin/lifestyle',
    icon: Camera,
    color: 'text-pink-600'
  },
  {
    title: 'Testimonials',
    url: '/admin/testimonials',
    icon: MessageSquare,
    color: 'text-teal-600'
  },
  {
    title: 'Newsletter',
    url: '/admin/newsletter',
    icon: Mail,
    color: 'text-indigo-600'
  }
];

export const toolsMenuItems = [
  {
    title: 'AI Tools',
    url: '/admin/ai-tools',
    icon: Sparkles,
    color: 'text-yellow-600'
  },
  {
    title: 'Site Settings',
    url: '/admin/site-settings',
    icon: Settings,
    color: 'text-gray-600'
  },
  {
    title: 'Sample Data',
    url: '/admin/sample-data',
    icon: Database,
    color: 'text-cyan-600'
  },
  {
    title: 'Profile',
    url: '/admin/profile',
    icon: User,
    color: 'text-emerald-600'
  }
];
