import {
  BarChart3,
  TrendingUp,
  BookOpen,
  FileText,
  Mail,
  Home,
  Wrench,
  HardHat,
  CalendarDays,
  MapPin,
  Star,
  Settings,
  Shield,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Bell,
  FileBarChart,
  HelpCircle,
  Ticket,
  Activity,
  Users,
  BookCheck,
} from 'lucide-react';
import type { PermissionKey } from '@/hooks/useTeamPermissions';

export interface MenuItem {
  title: string;
  /** If omitted, item is a collapsible parent only */
  href?: string;
  icon: typeof BarChart3;
  description: string;
  requiredPermission?: PermissionKey;
  /** Sub-items rendered as collapsible group */
  children?: MenuItem[];
  /** Optional stable key for identification */
  key?: string;
}

export const adminMenuItems: MenuItem[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Main admin dashboard with analytics',
    requiredPermission: 'view_dashboard',
  },
  {
    key: 'notifications',
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    description: 'View and manage your notifications',
  },
  {
    key: 'properties',
    title: 'Properties',
    href: '/admin/properties',
    icon: Home,
    description: 'Manage rental properties',
    requiredPermission: 'view_properties',
  },
  {
    key: 'calendar',
    title: 'Calendar',
    href: '/admin/calendar',
    icon: CalendarDays,
    description: 'Bookings, pricing, and external calendar sync',
  },
  {
    key: 'bookings',
    title: 'Bookings',
    href: '/admin/host/bookings',
    icon: BookCheck,
    description: 'Manage reservations and cleaning coordination',
    requiredPermission: 'view_bookings',
  },
  {
    key: 'guest-experience',
    title: 'Guest Experience',
    icon: MessageSquare,
    description: 'Inbox, messaging, and reviews',
    requiredPermission: 'respond_inquiries',
    children: [
      {
        title: 'Guest Inbox',
        href: '/admin/host/inbox',
        icon: Mail,
        description: 'Unified inbox for all guest communications',
        requiredPermission: 'respond_inquiries',
      },
      {
        title: 'Messaging',
        href: '/admin/guest-experience',
        icon: MessageSquare,
        description: 'Automated messaging rules and templates',
        requiredPermission: 'respond_inquiries',
      },
      {
        title: 'Reviews',
        href: '/admin/reviews',
        icon: Star,
        description: 'Guest reviews and testimonials',
      },
    ],
  },
  {
    key: 'content',
    title: 'Content',
    icon: FileText,
    description: 'Blog, pages, newsletter, and AI assistant',
    requiredPermission: 'edit_site',
    children: [
      {
        title: 'Blog',
        href: '/admin/blog',
        icon: BookOpen,
        description: 'Create and manage blog posts',
      },
      {
        title: 'Custom Pages',
        href: '/admin/pages',
        icon: FileText,
        description: 'Create additional custom pages for your site',
      },
      {
        title: 'Newsletter',
        href: '/admin/newsletter',
        icon: Mail,
        description: 'Newsletter campaigns and subscribers',
      },
      {
        title: 'AI Assistant',
        href: '/admin/ai-assistant',
        icon: Sparkles,
        description: 'AI-powered assistant for content and productivity',
      },
    ],
  },
  {
    key: 'local',
    title: 'Local',
    icon: MapPin,
    description: 'Events and local places',
    requiredPermission: 'edit_site',
    children: [
      {
        title: 'Events',
        href: '/admin/events',
        icon: CalendarDays,
        description: 'Manage local events and activities',
      },
      {
        title: 'Places',
        href: '/admin/places',
        icon: MapPin,
        description: 'Manage restaurants, attractions, and local places',
      },
    ],
  },
  {
    key: 'operations',
    title: 'Operations',
    icon: Wrench,
    description: 'Work orders, contractors, and checklists',
    children: [
      {
        title: 'Work Orders',
        href: '/admin/work-orders',
        icon: Wrench,
        description: 'Property maintenance and work orders',
      },
      {
        title: 'Contractors',
        href: '/admin/contractors',
        icon: HardHat,
        description: 'Manage contractors and service providers',
        requiredPermission: 'manage_bookings',
      },
      {
        title: 'Checklists',
        href: '/admin/checklists',
        icon: ClipboardList,
        description: 'Seasonal and periodic maintenance checklists',
      },
    ],
  },
  {
    key: 'analytics',
    title: 'Analytics',
    icon: TrendingUp,
    description: 'Performance metrics and reports',
    requiredPermission: 'view_reports',
    children: [
      {
        title: 'Property Analytics',
        href: '/admin/host/analytics',
        icon: TrendingUp,
        description: 'Revenue tracking, occupancy rates, and performance metrics',
        requiredPermission: 'view_reports',
      },
      {
        title: 'Reports',
        href: '/admin/reports',
        icon: FileBarChart,
        description: 'Booking, revenue, occupancy, guest and tax reports',
        requiredPermission: 'view_reports',
      },
    ],
  },
  {
    key: 'settings',
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Site, organization, integrations, team & access',
    requiredPermission: 'account_settings',
  },
  {
    key: 'help',
    title: 'Help & Support',
    icon: HelpCircle,
    description: 'Help center, support requests, and system status',
    children: [
      {
        title: 'Help Center',
        href: '/admin/help',
        icon: HelpCircle,
        description: 'Documentation, guides, and FAQs',
      },
      {
        title: 'My Requests',
        href: '/admin/my-requests',
        icon: Ticket,
        description: 'View your support tickets and feedback',
      },
      {
        title: 'System Status',
        href: '/admin/status',
        icon: Activity,
        description: 'Check system health and status',
      },
    ],
  },
  {
    key: 'team',
    title: 'Team',
    href: '/admin/settings/team',
    icon: Users,
    description: 'Manage team members, roles, and permissions',
    requiredPermission: 'manage_team',
  },
  {
    key: 'platform',
    title: 'Platform Admin',
    href: '/admin/platform',
    icon: Shield,
    description: 'Platform-wide administration (Super Admins only)',
  },
];
