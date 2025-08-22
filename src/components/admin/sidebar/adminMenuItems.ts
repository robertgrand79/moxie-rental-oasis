import {
  BarChart3,
  TrendingUp,
  BookOpen,
  FileText,
  Mail,
  Home,
  Wrench,
  HardHat,
  Calendar,
  MapPin,
  Camera,
  Star,
  Image,
  BarChart,
  Users,
  Shield,
  Settings,
  Database,
  TestTube,
  AlertTriangle,
} from 'lucide-react';

export const adminMenuItems = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: BarChart3,
        description: 'Main admin dashboard with analytics'
      }
    ]
  },
  {
    title: 'Content Management',
    items: [
      {
        title: 'Blog Management',
        href: '/admin/blog',
        icon: BookOpen,
        description: 'Create and manage blog posts'
      },
      {
        title: 'Page Management',
        href: '/admin/pages',
        icon: FileText,
        description: 'Manage website pages'
      },
      {
        title: 'Newsletter',
        href: '/admin/newsletter',
        icon: Mail,
        description: 'Newsletter campaigns and subscribers'
      }
    ]
  },
  {
    title: 'Property & Booking',
    items: [
      {
        title: 'Properties',
        href: '/admin/properties',
        icon: Home,
        description: 'Manage rental properties'
      },
      {
        title: 'Work Orders',
        href: '/admin/work-orders',
        icon: Wrench,
        description: 'Property maintenance and work orders'
      },
      {
        title: 'Contractors',
        href: '/admin/contractors',
        icon: HardHat,
        description: 'Manage contractors and service providers'
      },
      {
        title: 'Turno Problems',
        href: '/admin/turno-problems',
        icon: AlertTriangle,
        description: 'Manage problems from Turno field service'
      }
    ]
  },
  {
    title: 'Local Content',
    items: [
      {
        title: 'Eugene Events',
        href: '/admin/events',
        icon: Calendar,
        description: 'Manage local Eugene events'
      },
      {
        title: 'Points of Interest',
        href: '/admin/poi',
        icon: MapPin,
        description: 'Manage local attractions and places'
      },
      {
        title: 'Lifestyle Gallery',
        href: '/admin/lifestyle',
        icon: Camera,
        description: 'Manage lifestyle and activity images'
      },
      {
        title: 'Testimonials',
        href: '/admin/testimonials',
        icon: Star,
        description: 'Guest reviews and testimonials'
      }
    ]
  },
  {
    title: 'Advanced Features',
    items: [
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart,
        description: 'Advanced analytics and insights'
      },
      {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        description: 'Manage users and permissions'
      },
      {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: Shield,
        description: 'Role-based access control'
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        title: 'System Administration',
        href: '/admin/system-administration',
        icon: Wrench,
        description: 'Comprehensive system metrics, testing, and optimization'
      },
      {
        title: 'Site Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'Configure site settings and preferences'
      }
    ]
  }
];
