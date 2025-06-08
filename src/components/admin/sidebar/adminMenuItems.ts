
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
  ArrowLeft,
  FileText,
  BookOpen
} from 'lucide-react';

export const coreMenuItems = [
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

export const contentMenuItems = [
  {
    title: 'Properties',
    href: '/admin/properties',
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
    title: 'Page Management',
    href: '/admin/page-management',
    icon: FileText,
    color: 'text-icon-blue'
  },
  {
    title: 'Blog Management',
    href: '/admin/blog-management',
    icon: BookOpen,
    color: 'text-icon-purple'
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

export const toolsMenuItems = [
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
