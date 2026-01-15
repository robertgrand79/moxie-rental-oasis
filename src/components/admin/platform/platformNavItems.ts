import {
  Building2,
  Users,
  Layout,
  Settings,
  Activity,
  HelpCircle,
  Inbox,
  Rocket,
  FileText,
  Search,
  TestTube,
  LayoutDashboard,
  Workflow,
  Mail,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Bell,
  Milestone,
  Brain,
} from 'lucide-react';

export interface PlatformNavItem {
  key: string;
  label: string;
  icon: typeof Building2;
  path: string;
  description: string;
  section: 'core' | 'content' | 'system' | 'development';
}

export const platformNavItems: PlatformNavItem[] = [
  // Core
  {
    key: 'organizations',
    label: 'Organizations',
    icon: Building2,
    path: '/admin/platform/organizations',
    description: 'Manage all tenant organizations',
    section: 'core',
  },
  {
    key: 'users',
    label: 'Platform Users',
    icon: Users,
    path: '/admin/platform/users',
    description: 'View and manage all platform users',
    section: 'core',
  },
  {
    key: 'templates',
    label: 'Templates',
    icon: Layout,
    path: '/admin/platform/templates',
    description: 'Manage site templates',
    section: 'core',
  },
  {
    key: 'billing',
    label: 'Billing',
    icon: CreditCard,
    path: '/admin/platform/billing',
    description: 'Subscriptions, revenue, and failed payments',
    section: 'core',
  },
  {
    key: 'ai',
    label: 'AI Management',
    icon: Brain,
    path: '/admin/platform/ai',
    description: 'Monitor AI usage, limits, and abuse detection',
    section: 'core',
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    icon: TrendingUp,
    path: '/admin/platform/onboarding',
    description: 'Funnel analytics, health scores, stuck detection',
    section: 'core',
  },

  // Content & Support
  {
    key: 'help-center',
    label: 'Help Center',
    icon: HelpCircle,
    path: '/admin/platform/help-center',
    description: 'Manage help content and documentation',
    section: 'content',
  },
  {
    key: 'inbox',
    label: 'Platform Inbox',
    icon: Inbox,
    path: '/admin/platform/inbox',
    description: 'Support tickets and user feedback',
    section: 'content',
  },
  {
    key: 'email',
    label: 'Email Inbox',
    icon: Mail,
    path: '/admin/platform/email',
    description: 'Unified email inbox for all platform addresses',
    section: 'content',
  },
  {
    key: 'workflows',
    label: 'Task Workflows',
    icon: Workflow,
    path: '/admin/platform/workflows',
    description: 'Automated task templates and triggers',
    section: 'content',
  },
  {
    key: 'communications',
    label: 'Communications',
    icon: MessageSquare,
    path: '/admin/platform/communications',
    description: 'Announcements, campaigns, and in-app banners',
    section: 'content',
  },
  {
    key: 'notifications',
    label: 'Activity Log',
    icon: Bell,
    path: '/admin/platform/notifications',
    description: 'View all platform activity and notifications',
    section: 'content',
  },

  // System
  {
    key: 'settings',
    label: 'Platform Settings',
    icon: Settings,
    path: '/admin/platform/settings',
    description: 'Configure platform-wide settings',
    section: 'system',
  },
  {
    key: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    path: '/admin/platform/monitoring',
    description: 'System health and performance metrics',
    section: 'system',
  },
  {
    key: 'audit',
    label: 'Audit Logs',
    icon: FileText,
    path: '/admin/platform/audit',
    description: 'View system audit logs',
    section: 'system',
  },
  {
    key: 'lookup',
    label: 'Lookup Tools',
    icon: Search,
    path: '/admin/platform/lookup',
    description: 'Search and lookup utilities',
    section: 'system',
  },

  // Development
  {
    key: 'template-test',
    label: 'Template Test',
    icon: TestTube,
    path: '/admin/platform/template-test',
    description: 'Test template system functionality',
    section: 'development',
  },
  {
    key: 'launch',
    label: 'Launch Checklist',
    icon: Rocket,
    path: '/admin/platform/launch',
    description: 'Pre-launch readiness verification',
    section: 'development',
  },
  {
    key: 'roadmap',
    label: 'Roadmap',
    icon: Milestone,
    path: '/admin/platform/roadmap',
    description: 'Plan and track platform improvements',
    section: 'development',
  },
];

export const getSectionItems = (section: PlatformNavItem['section']) =>
  platformNavItems.filter(item => item.section === section);

export const getNavItemByKey = (key: string) =>
  platformNavItems.find(item => item.key === key);

export const dashboardNavItem: PlatformNavItem = {
  key: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  path: '/admin/platform',
  description: 'Platform overview and quick access',
  section: 'core',
};
