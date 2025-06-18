
import { 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  Home,
  Calendar,
  MapPin,
  Camera,
  Star,
  Mail,
  TrendingUp,
  Shield,
  Wrench,
  HardHat
} from 'lucide-react';

export interface MenuItem {
  title: string;
  icon: any;
  href: string;
  description?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const adminMenuItems: MenuSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        icon: BarChart3,
        href: '/admin',
        description: 'Overview and analytics'
      },
      {
        title: 'Analytics',
        icon: TrendingUp,
        href: '/admin/analytics',
        description: 'Detailed performance metrics'
      },
      {
        title: 'Site Metrics',
        icon: BarChart3,
        href: '/admin/site-metrics',
        description: 'Website performance data'
      }
    ]
  },
  {
    title: 'Content Management',
    items: [
      {
        title: 'Properties',
        icon: Home,
        href: '/admin/properties',
        description: 'Manage rental listings'
      },
      {
        title: 'Blog Posts',
        icon: FileText,
        href: '/admin/blog-posts',
        description: 'Create and edit blog content'
      },
      {
        title: 'Pages',
        icon: FileText,
        href: '/admin/pages',
        description: 'Manage website pages'
      }
    ]
  },
  {
    title: 'Operations',
    items: [
      {
        title: 'Work Orders',
        icon: Wrench,
        href: '/admin/workorders',
        description: 'Contractor work orders'
      },
      {
        title: 'Contractors',
        icon: HardHat,
        href: '/admin/contractors',
        description: 'Manage contractors and vendor relationships'
      }
    ]
  },
  {
    title: 'Local Content',
    items: [
      {
        title: 'Eugene Events',
        icon: Calendar,
        href: '/admin/eugene-events',
        description: 'Eugene events calendar'
      },
      {
        title: 'Lifestyle Gallery',
        icon: Camera,
        href: '/admin/lifestyle-gallery',
        description: 'Local lifestyle photos'
      },
      {
        title: 'Points of Interest',
        icon: MapPin,
        href: '/admin/points-of-interest',
        description: 'Local attractions and venues'
      },
      {
        title: 'Testimonials',
        icon: Star,
        href: '/admin/testimonials',
        description: 'Guest reviews and feedback'
      }
    ]
  },
  {
    title: 'Marketing',
    items: [
      {
        title: 'Newsletter',
        icon: Mail,
        href: '/admin/newsletter',
        description: 'Email newsletter management'
      }
    ]
  },
  {
    title: 'User Management',
    items: [
      {
        title: 'Users',
        icon: Users,
        href: '/admin/users',
        description: 'Manage user accounts'
      },
      {
        title: 'Roles & Permissions',
        icon: Shield,
        href: '/admin/roles-permissions',
        description: 'User access control'
      }
    ]
  },
  {
    title: 'Configuration',
    items: [
      {
        title: 'Settings',
        icon: Settings,
        href: '/admin/settings',
        description: 'Website configuration'
      }
    ]
  }
];
