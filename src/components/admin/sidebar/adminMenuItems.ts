
import { 
  Home, 
  LayoutDashboard, 
  Settings, 
  Users, 
  Wand2, 
  FileText, 
  Mail, 
  Star, 
  Sparkles,
  Plus,
  Shield,
  GitFork,
  BarChart3,
  TrendingUp,
  Wrench,
  CheckSquare,
  Calendar
} from 'lucide-react';

export const adminMenuItems = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        icon: LayoutDashboard,
        href: "/admin"
      },
      {
        title: "Analytics",
        icon: BarChart3,
        href: "/admin/analytics"
      },
      {
        title: "Site Metrics", 
        icon: TrendingUp,
        href: "/admin/site-metrics"
      }
    ]
  },
  {
    title: "Properties",
    items: [
      {
        title: "All Properties",
        icon: Home,
        href: "/admin/properties"
      },
      {
        title: "Add New Property",
        icon: Plus,
        href: "/admin/properties/new?action=add"
      }
    ]
  },
  {
    title: "Operations & Management",
    items: [
      {
        title: "Task Management",
        icon: CheckSquare,
        href: "/admin/tasks"
      },
      {
        title: "Work Orders",
        icon: Wrench,
        href: "/admin/work-orders"
      }
    ]
  },
  {
    title: "Content Management",
    items: [
      {
        title: "Testimonials",
        icon: Star,
        href: "/admin/testimonials"
      },
      {
        title: "Lifestyle Gallery",
        icon: Home,
        href: "/admin/lifestyle"
      },
      {
        title: "Events",
        icon: Calendar,
        href: "/admin/events"
      },
      {
        title: "Points of Interest",
        icon: Star,
        href: "/admin/poi"
      }
    ]
  },
  {
    title: "AI & Content Tools",
    items: [
      {
        title: "AI Content Generator",
        icon: Wand2,
        href: "/admin/ai-tools"
      },
      {
        title: "Content Workflows",
        icon: Sparkles,
        href: "/admin/content-workflows"
      }
    ]
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Newsletter Management",
        icon: Mail,
        href: "/admin/newsletter-management"
      },
      {
        title: "Blog Management",
        icon: FileText,
        href: "/admin/blog"
      }
    ]
  },
  {
    title: "Settings & Admin",
    items: [
      {
        title: "Users",
        icon: Users,
        href: "/admin/users"
      },
      {
        title: "Roles & Permissions",
        icon: Shield,
        href: "/admin/roles"
      },
      {
        title: "Site Settings",
        icon: Settings,
        href: "/admin/settings"
      }
    ]
  }
];
