import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsTile from '@/components/admin/settings/SettingsTile';
import { 
  Building2, 
  Globe, 
  Palette, 
  Users, 
  Plug, 
  CreditCard,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

// Sub-page components
import OrganizationSettingsPanel from '@/components/admin/settings-hub/OrganizationSettingsPanel';
import SiteContentSettingsPanel from '@/components/admin/settings-hub/SiteContentSettingsPanel';
import AppearanceSettingsPanel from '@/components/admin/settings-hub/AppearanceSettingsPanel';
import TeamAccessSettingsPanel from '@/components/admin/settings-hub/TeamAccessSettingsPanel';
import IntegrationsSettingsPanel from '@/components/admin/settings-hub/IntegrationsSettingsPanel';
import PaymentsSettingsPanel from '@/components/admin/settings-hub/PaymentsSettingsPanel';
import LocalContentSettingsPanel from '@/components/admin/settings-hub/LocalContentSettingsPanel';

type SettingsSection = 
  | 'hub' 
  | 'organization' 
  | 'site' 
  | 'appearance' 
  | 'team' 
  | 'integrations' 
  | 'payments' 
  | 'content';

const settingsTiles = [
  {
    id: 'organization' as const,
    title: 'Organization',
    description: 'Name, slug, website, billing & subscription',
    icon: Building2,
  },
  {
    id: 'site' as const,
    title: 'Site & Content',
    description: 'Site info, hero section, contact, SEO, analytics',
    icon: Globe,
  },
  {
    id: 'appearance' as const,
    title: 'Appearance',
    description: 'Colors, fonts, logo, favicon, custom CSS',
    icon: Palette,
  },
  {
    id: 'team' as const,
    title: 'Team & Access',
    description: 'Users, roles, permissions, access control',
    icon: Users,
  },
  {
    id: 'integrations' as const,
    title: 'Integrations',
    description: 'API connections, webhooks, third-party services',
    icon: Plug,
  },
  {
    id: 'payments' as const,
    title: 'Payments',
    description: 'Stripe configuration, PriceLabs pricing',
    icon: CreditCard,
  },
  {
    id: 'content' as const,
    title: 'Local Content',
    description: 'Events, places, testimonials & reviews',
    icon: MapPin,
  },
];

const AdminSettingsHub = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('hub');
  const { organization } = useCurrentOrganization();
  const navigate = useNavigate();

  const handleTileClick = (sectionId: SettingsSection) => {
    setActiveSection(sectionId);
  };

  const handleBack = () => {
    setActiveSection('hub');
  };

  const getPageTitle = () => {
    if (activeSection === 'hub') return 'Settings';
    const tile = settingsTiles.find(t => t.id === activeSection);
    return tile?.title || 'Settings';
  };

  const getPageDescription = () => {
    if (activeSection === 'hub') return 'Configure your site, organization, and integrations';
    const tile = settingsTiles.find(t => t.id === activeSection);
    return tile?.description || '';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'organization':
        return <OrganizationSettingsPanel />;
      case 'site':
        return <SiteContentSettingsPanel />;
      case 'appearance':
        return <AppearanceSettingsPanel />;
      case 'team':
        return <TeamAccessSettingsPanel />;
      case 'integrations':
        return <IntegrationsSettingsPanel />;
      case 'payments':
        return <PaymentsSettingsPanel />;
      case 'content':
        return <LocalContentSettingsPanel />;
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {settingsTiles.map((tile) => (
              <SettingsTile
                key={tile.id}
                title={tile.title}
                description={tile.description}
                icon={tile.icon}
                onClick={() => handleTileClick(tile.id)}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <AdminPageWrapper
      title={getPageTitle()}
      description={getPageDescription()}
    >
      <div className="p-6 lg:p-8">
        {activeSection !== 'hub' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        )}
        
        {renderContent()}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSettingsHub;
