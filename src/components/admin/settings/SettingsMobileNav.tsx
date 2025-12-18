import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Map,
  CreditCard,
  DollarSign,
} from 'lucide-react';

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
      { label: 'Organization', href: '/admin/settings/general', icon: Building2 },
      { label: 'Domain', href: '/admin/settings/domain', icon: Globe },
      { label: 'Billing', href: '/admin/settings/billing', icon: Receipt },
    ],
  },
  {
    title: 'Site & Content',
    items: [
      { label: 'Site Info', href: '/admin/settings/site-info', icon: FileText },
      { label: 'Hero Section', href: '/admin/settings/hero', icon: Image },
      { label: 'About Page', href: '/admin/settings/about', icon: UsersIcon },
      { label: 'Contact', href: '/admin/settings/contact', icon: Phone },
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
      { label: 'Communications', href: '/admin/settings/communications', icon: MessageSquare },
      { label: 'Smart Home', href: '/admin/settings/smart-home', icon: Lock },
      { label: 'Services', href: '/admin/settings/services', icon: Plug },
      { label: 'Maps', href: '/admin/settings/maps', icon: Map },
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

const SettingsMobileNav: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  
  // Find current page label
  const getCurrentLabel = () => {
    for (const group of settingsNavGroups) {
      for (const item of group.items) {
        if (location.pathname === item.href) {
          return item.label;
        }
      }
    }
    return 'Settings';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            {getCurrentLabel()}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-6">
            {settingsNavGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
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
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMobileNav;
