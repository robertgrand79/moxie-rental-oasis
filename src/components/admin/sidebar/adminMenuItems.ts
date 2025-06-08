
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
  GitFork
} from 'lucide-react';

export const adminMenuItems = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Analytics",
        icon: LayoutDashboard,
        href: "/admin"
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
        title: "Add New",
        icon: Plus,
        href: "/admin/properties/new"
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
      }
    ]
  },
  {
    title: "Users & Roles",
    items: [
      {
        title: "All Users",
        icon: Users,
        href: "/admin/users"
      },
      {
        title: "Roles & Permissions",
        icon: Shield,
        href: "/admin/roles"
      }
    ]
  },
  {
    title: "Settings",
    items: [
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
