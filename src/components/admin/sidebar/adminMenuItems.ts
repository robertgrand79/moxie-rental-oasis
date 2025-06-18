
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Settings,
  UserCog,
  Users,
} from 'lucide-react';

export const adminMenuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    permissions: ['admin.access_panel'],
  },
  {
    title: 'Properties',
    icon: Building2,
    href: '/admin/properties',
    permissions: ['properties.read'],
  },
  {
    title: 'Tasks',
    icon: ListChecks,
    href: '/admin/tasks',
    permissions: ['tasks.read'],
  },
  {
    title: 'Work Orders',
    icon: CheckCircle2,
    href: '/admin/workorders',
    permissions: ['workorders.read'],
  },
  {
    title: 'Calendar',
    icon: Calendar,
    href: '/admin/calendar',
    permissions: ['calendar.read'],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
    permissions: ['analytics.view'],
  },
  {
    title: 'User Management (Enhanced)',
    icon: Users,
    href: '/admin/user-management-enhanced',
    permissions: ['users.read', 'users.update'],
    badge: 'NEW'
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/admin/settings',
    permissions: ['admin.manage_settings'],
  },
  {
    title: 'Admin Profile',
    icon: UserCog,
    href: '/admin/profile',
    permissions: ['admin.access_panel'],
  },
];
