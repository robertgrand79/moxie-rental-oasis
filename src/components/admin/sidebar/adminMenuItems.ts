
import { 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  Home,
  MessageSquare,
  Calendar,
  MapPin,
  Camera,
  Star,
  Mail,
  TrendingUp,
  Wand2,
  UserCheck,
  Shield,
  CheckSquare2,
  Wrench,
  Building2,
  ClipboardList
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
        href: '/admin/blog',
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
        title: 'Property Management',
        icon: Building2,
        href: '/admin/property-management',
        description: 'Comprehensive property operations'
      },
      {
        title: 'Task Management',
        icon: CheckSquare2,
        href: '/admin/task-management',
        description: 'Project and task tracking'
      },
      {
        title: 'Work Orders',
        icon: Wrench,
        href: '/admin/work-orders',
        description: 'Contractor work orders'
      }
    ]
  },
  {
    title: 'Local Content',
    items: [
      {
        title: 'Events',
        icon: Calendar,
        href: '/admin/events',
        description: 'Eugene events calendar'
      },
      {
        title: 'Lifestyle Gallery',
        icon: Camera,
        href: '/admin/lifestyle',
        description: 'Local lifestyle photos'
      },
      {
        title: 'Points of Interest',
        icon: MapPin,
        href: '/admin/poi',
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
    title: 'AI & Automation',
    items: [
      {
        title: 'AI Chat',
        icon: MessageSquare,
        href: '/admin/ai-chat',
        description: 'AI assistant and chat tools'
      },
      {
        title: 'Content Review',
        icon: Wand2,
        href: '/admin/ai-content-review',
        description: 'AI-generated content approval'
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
      },
      {
        title: 'Newsletter Management',
        icon: Mail,
        href: '/admin/newsletter-management',
        description: 'Advanced newsletter tools'
      }
    ]
  },
  {
    title: 'User Management',
    items: [
      {
        title: 'Users',
        icon: Users,
        href: '/admin/user-management',
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
        title: 'Site Settings',
        icon: Settings,
        href: '/admin/settings',
        description: 'Website configuration'
      }
    ]
  }
];
