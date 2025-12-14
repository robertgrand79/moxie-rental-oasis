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
  Star,
  Settings,
  Shield,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  Sparkles,
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
      },
      {
        title: 'AI Assistant',
        href: '/admin/ai-assistant',
        icon: Sparkles,
        description: 'Your AI-powered assistant for content and productivity'
      }
    ]
  },
  {
    title: 'Local Content',
    items: [
      {
        title: 'Events',
        href: '/admin/events',
        icon: Calendar,
        description: 'Manage local events and activities'
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
    title: 'Host Management',
    items: [
      {
        title: 'Property Analytics',
        href: '/admin/host/analytics',
        icon: TrendingUp,
        description: 'Revenue tracking, occupancy rates, and performance metrics'
      },
      {
        title: 'Booking Management',
        href: '/admin/host/bookings',
        icon: Calendar,
        description: 'Manage reservations, cleaning coordination, and work orders'
      },
      {
        title: 'Calendar Management',
        href: '/admin/calendar',
        icon: Calendar,
        description: 'View bookings, pricing calendar, PriceLabs integration, and external calendar sync'
      },
      {
        title: 'Guest Inbox',
        href: '/admin/host/inbox',
        icon: Mail,
        description: 'Unified inbox for all guest communications'
      },
      {
        title: 'Guest Experience',
        href: '/admin/guest-experience',
        icon: MessageSquare,
        description: 'Automated messaging rules and templates'
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
        title: 'Checklists',
        href: '/admin/checklists',
        icon: ClipboardList,
        description: 'Seasonal and periodic maintenance checklists'
      }
    ]
  },
  {
    title: 'Configuration',
    items: [
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'Site, organization, integrations, team & access'
      }
    ]
  },
  {
    title: 'Platform Administration',
    items: [
      {
        title: 'Super Admin Panel',
        href: '/admin/platform',
        icon: Shield,
        description: 'Platform-wide organization management (Super Admins only)'
      }
    ]
  }
];
