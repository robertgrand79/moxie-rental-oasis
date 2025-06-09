import {
  LayoutDashboard,
  FileText,
  Globe,
  Mail,
  Home,
  MapPin,
  Calendar,
  Camera,
  Star,
  Wrench,
  CheckSquare,
  BarChart3,
  Bot,
  GitBranch,
  Settings,
  Users
} from "lucide-react"

export const adminMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
    description: "Overview and quick actions"
  },
  {
    title: "Content",
    icon: FileText,
    items: [
      {
        title: "Blog Management",
        icon: FileText,
        path: "/admin/blog",
        description: "Manage blog posts and content"
      },
      {
        title: "Page Management",
        icon: Globe,
        path: "/admin/pages",
        description: "Manage website pages"
      },
      {
        title: "Newsletter",
        icon: Mail,
        path: "/admin/newsletter",
        description: "Manage newsletter campaigns"
      }
    ]
  },
  {
    title: "Properties",
    icon: Home,
    path: "/admin/properties",
    description: "Manage property listings"
  },
  {
    title: "Local Content",
    icon: MapPin,
    items: [
      {
        title: "Events",
        icon: Calendar,
        path: "/admin/events",
        description: "Manage Eugene events"
      },
      {
        title: "Lifestyle Gallery",
        icon: Camera,
        path: "/admin/lifestyle",
        description: "Manage lifestyle content"
      },
      {
        title: "Points of Interest",
        icon: MapPin,
        path: "/admin/poi",
        description: "Manage local attractions"
      },
      {
        title: "Testimonials",
        icon: Star,
        path: "/admin/testimonials",
        description: "Manage customer reviews"
      }
    ]
  },
  {
    title: "Operations",
    icon: Wrench,
    items: [
      {
        title: "Task Management",
        icon: CheckSquare,
        path: "/admin/tasks",
        description: "Manage tasks and projects"
      },
      {
        title: "Work Orders",
        icon: Wrench,
        path: "/admin/work-orders",
        description: "Manage maintenance requests"
      }
    ]
  },
  {
    title: "Analytics & AI",
    icon: BarChart3,
    items: [
      {
        title: "Site Metrics",
        icon: BarChart3,
        path: "/admin/metrics",
        description: "View website analytics"
      },
      {
        title: "AI Tools",
        icon: Bot,
        path: "/admin/ai-tools",
        description: "AI content generation tools"
      },
      {
        title: "Content Workflows",
        icon: GitBranch,
        path: "/admin/workflows",
        description: "Manage content approval"
      }
    ]
  },
  {
    title: "System",
    icon: Settings,
    items: [
      {
        title: "Site Settings",
        icon: Settings,
        path: "/admin/settings",
        description: "Configure website settings"
      },
      {
        title: "User Permissions",
        icon: Users,
        path: "/admin/user-permissions",
        description: "Manage users, roles and permissions"
      }
    ]
  }
];
