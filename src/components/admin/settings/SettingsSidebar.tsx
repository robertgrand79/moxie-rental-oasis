import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import {
  Building2,
  Globe,
  Receipt,
  FileText,
  Image,
  Users as UsersIcon,
  Phone,
  Search,
  BarChart,
  Palette,
  Type,
  ImageIcon,
  Shield,
  Bell,
  Bot,
  MessageSquare,
  Lock,
  Plug,
  CreditCard,
  DollarSign,
  Rocket,
  Tv,
  Menu,
  Share2,
  Layout,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SettingsNavGroup {
  title: string;
  items: SettingsNavItem[];
}

const settingsNavGroups: SettingsNavGroup[] = [
  {
    title: 'General',
    items: [
      { label: 'Setup Wizard', href: '/admin/settings/setup', icon: Rocket },
      { label: 'Template', href: '/admin/settings/template', icon: Layout },
      { label: 'Organization', href: '/admin/settings/general', icon: Building2 },
      { label: 'Domain', href: '/admin/settings/domain', icon: Globe },
      { label: 'Billing', href: '/admin/settings/billing', icon: Receipt },
    ],
  },
  {
    title: 'Site & Content',
    items: [
      { label: 'Site Info', href: '/admin/settings/site-info', icon: FileText },
      { label: 'Navigation', href: '/admin/settings/navigation', icon: Menu },
      { label: 'Hero Section', href: '/admin/settings/hero', icon: Image },
      { label: 'About Page', href: '/admin/settings/about', icon: UsersIcon },
      { label: 'Contact', href: '/admin/settings/contact', icon: Phone },
      { label: 'Social & Media', href: '/admin/settings/social', icon: Share2 },
      { label: 'SEO', href: '/admin/settings/seo', icon: Search },
      { label: 'Analytics', href: '/admin/settings/analytics', icon: BarChart },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { label: 'Colors', href: '/admin/settings/colors', icon: Palette },
      { label: 'Fonts', href: '/admin/settings/fonts', icon: Type },
      { label: 'Branding', href: '/admin/settings/branding', icon: ImageIcon },
    ],
  },
  {
    title: 'Team & Access',
    items: [
      { label: 'Users', href: '/admin/settings/users', icon: UsersIcon },
      { label: 'Roles', href: '/admin/settings/roles', icon: Shield },
      { label: 'Notifications', href: '/admin/settings/notifications-settings', icon: Bell },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { label: 'AI Assistant', href: '/admin/settings/ai-assistant', icon: Bot },
      { label: 'TV Devices', href: '/admin/settings/tv-devices', icon: Tv },
      { label: 'Communications', href: '/admin/settings/communications', icon: MessageSquare },
      { label: 'Smart Home', href: '/admin/settings/smart-home', icon: Lock },
      { label: 'Services', href: '/admin/settings/services', icon: Plug },
    ],
  },
  {
    title: 'Payments',
    items: [
      { label: 'Stripe', href: '/admin/settings/stripe', icon: CreditCard },
      { label: 'PriceLabs', href: '/admin/settings/pricelabs', icon: DollarSign },
    ],
  },
];

const SettingsSidebar: React.FC = () => {
  const location = useLocation();
  
  // Determine which groups should be open based on current path
  const getOpenGroups = () => {
    const openGroups: Record<string, boolean> = {};
    settingsNavGroups.forEach((group) => {
      const isGroupActive = group.items.some((item) => location.pathname === item.href);
      openGroups[group.title] = isGroupActive;
    });
    return openGroups;
  };

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(getOpenGroups);

  // Update open groups when location changes
  React.useEffect(() => {
    const newOpenGroups = getOpenGroups();
    setOpenGroups((prev) => {
      // Only open new groups, don't close manually opened ones
      const merged = { ...prev };
      Object.keys(newOpenGroups).forEach((key) => {
        if (newOpenGroups[key]) {
          merged[key] = true;
        }
      });
      return merged;
    });
  }, [location.pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="w-64 border-r border-border bg-card shrink-0 hidden lg:block">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-4 space-y-1">
          {settingsNavGroups.map((group) => (
            <Collapsible
              key={group.title}
              open={openGroups[group.title]}
              onOpenChange={() => toggleGroup(group.title)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors">
                <span>{group.title}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    openGroups[group.title] && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ml-2',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default SettingsSidebar;
