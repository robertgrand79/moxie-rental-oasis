
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
  TrendingUp,
  Monitor,
  Eye,
  Mail,
  Send,
  Users,
  Shield,
  CheckSquare,
  Clipboard,
  Wrench,
  Cog,
} from 'lucide-react';

export const adminMenuItems = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Overview', href: '/admin', icon: LayoutDashboard },
      { title: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
      { title: 'Site Metrics', href: '/admin/site-metrics', icon: Monitor },
    ]
  },
  {
    title: 'Content Management',
    items: [
      { title: 'AI Assistant', href: '/admin/ai-chat', icon: Wand2 },
      { title: 'AI Content Review', href: '/admin/ai-content-review', icon: Eye },
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
    title: 'Communications',
    items: [
      { title: 'Newsletter', href: '/admin/newsletter', icon: Mail },
      { title: 'Newsletter Management', href: '/admin/newsletter-management', icon: Send },
    ]
  },
  {
    title: 'User & Access Management',
    items: [
      { title: 'User Management', href: '/admin/user-management', icon: Users },
      { title: 'Roles & Permissions', href: '/admin/roles-permissions', icon: Shield },
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Task Management', href: '/admin/task-management', icon: CheckSquare },
      { title: 'Work Orders', href: '/admin/work-orders', icon: Wrench },
    ]
  },
  {
    title: 'Settings',
    items: [
      { title: 'Site Settings', href: '/admin/settings', icon: Settings },
      { title: 'Advanced Settings', href: '/admin/settings-redesigned', icon: Cog },
    ]
  }
];
