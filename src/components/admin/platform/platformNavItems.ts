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
  LayoutDashboard
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
