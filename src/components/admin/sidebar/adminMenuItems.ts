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
    title: 'Local Content',
    items: [
      {
        title: 'Eugene Events',
        href: '/admin/events',
        icon: Calendar,
        description: 'Manage local Eugene events'
      },
      {
        title: 'Places',
        href: '/admin/places',
        icon: MapPin,
        description: 'Manage restaurants, attractions, activities, and local places'
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
    title: 'Settings & Analytics',
    items: [
      {
        title: 'Analytics & Insights',
        href: '/admin/analytics',
        icon: BarChart,
        description: 'Comprehensive analytics covering content, site health, marketing, and real-time monitoring'
      },
      {
        title: 'User & Access Management',
        href: '/admin/user-access-management',
        icon: Users,
        description: 'Manage users, roles, permissions, and access control'
      },
      {
        title: 'System Administration',
        href: '/admin/system-administration',
        icon: Database,
        description: 'System testing, optimization, and technical diagnostics'
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
