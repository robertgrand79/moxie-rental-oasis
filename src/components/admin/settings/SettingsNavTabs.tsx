import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, Globe, Palette, Users, Plug, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsTabs = [
  { id: 'organization', label: 'Organization', href: '/admin/settings/organization', icon: Building2 },
  { id: 'site', label: 'Site & Content', href: '/admin/settings/site-content', icon: Globe },
  { id: 'appearance', label: 'Appearance', href: '/admin/settings/appearance', icon: Palette },
  { id: 'team', label: 'Team', href: '/admin/settings/team', icon: Users },
  { id: 'integrations', label: 'Integrations', href: '/admin/settings/integrations', icon: Plug },
  { id: 'payments', label: 'Payments', href: '/admin/settings/payments', icon: CreditCard },
];

const SettingsNavTabs: React.FC = () => {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex overflow-x-auto" aria-label="Settings navigation">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.id}
              to={tab.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )
              }
            >
              <Icon className="h-4 w-4 hidden sm:block" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsNavTabs;
