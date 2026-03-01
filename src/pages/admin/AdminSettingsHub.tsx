import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsTile from '@/components/admin/settings-hub/SettingsTile';
import { 
  Building2, 
  Globe, 
  Palette, 
  Users, 
  Plug, 
  CreditCard,
  Layout
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSettingsCompletion } from '@/hooks/useSettingsCompletion';

const settingsTiles = [
  {
    id: 'template',
    title: 'Template',
    description: 'Switch between site templates and layouts',
    icon: Layout,
    href: '/admin/settings/template',
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Name, slug, website, billing & subscription',
    icon: Building2,
    href: '/admin/settings/organization',
  },
  {
    id: 'site',
    title: 'Site & Content',
    description: 'Site info, hero section, contact, SEO, analytics',
    icon: Globe,
    href: '/admin/settings/site-content',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Colors, fonts, logo, favicon, custom CSS',
    icon: Palette,
    href: '/admin/settings/appearance',
  },
  {
    id: 'team',
    title: 'Team & Access',
    description: 'Users, roles, permissions, access control',
    icon: Users,
    href: '/admin/settings/team',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'API connections, webhooks, third-party services',
    icon: Plug,
    href: '/admin/settings/integrations',
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Stripe configuration, PriceLabs pricing',
    icon: CreditCard,
    href: '/admin/settings/payments',
  },
];

const AdminSettingsHub = () => {
  const { organization } = useCurrentOrganization();
  const navigate = useNavigate();
  const { data: completion, isLoading: completionLoading } = useSettingsCompletion();

  const getBadgeText = (categoryId: string) => {
    const cat = completion?.categories[categoryId];
    if (!cat) return undefined;
    
    switch (cat.status) {
      case 'complete':
        return 'Complete';
      case 'partial':
        return `${cat.complete}/${cat.total}`;
      case 'needs-setup':
        return 'Needs Setup';
      default:
        return undefined;
    }
  };

  return (
    <AdminPageWrapper
      title="Settings"
      description="Configure your site, organization, and integrations"
    >
      <div className="p-6 lg:p-8 space-y-6">
        {/* Progress Section */}
        {completion && (
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">Site Setup Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completion.completeCount} of {completion.totalCount} sections complete
                </p>
              </div>
              <span className="text-2xl font-bold text-primary">
                {completion.overallPercentage}%
              </span>
            </div>
            <Progress value={completion.overallPercentage} className="h-2" />
          </div>
        )}

        {/* Settings Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {settingsTiles.map((tile) => (
            <SettingsTile
              key={tile.id}
              title={tile.title}
              description={tile.description}
              icon={tile.icon}
              onClick={() => navigate(tile.href)}
              badge={getBadgeText(tile.id)}
              badgeVariant={completion?.categories[tile.id]?.status}
            />
          ))}
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSettingsHub;
