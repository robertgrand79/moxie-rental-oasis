
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
  Calendar,
  File
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
        href: "/admin/properties/new"
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
    title: "Content & Marketing",
    items: [
      {
        title: "Content Workflows",
        icon: Wand2,
        href: "/admin/content-workflows"
      },
      {
        title: "AI Tools",
        icon: Sparkles, 
        href: "/admin/ai-tools"
      },
      {
        title: "Site Pages",
        icon: File,
        href: "/admin/pages"
      },
      {
        title: "Blog Management",
        icon: FileText,
        href: "/admin/blog"
      },
      {
        title: "Newsletter",
        icon: Mail,
        href: "/admin/newsletter"
      },
      {
        title: "Testimonials",
        icon: Star,
        href: "/admin/testimonials"
      },
      {
        title: "Lifestyle Gallery",
        icon: Home,
        href: "/admin/lifestyle"
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
      },
      {
        title: "Integrations",
        icon: GitFork,
        href: "/admin/integrations"
      }
    ]
  }
];
