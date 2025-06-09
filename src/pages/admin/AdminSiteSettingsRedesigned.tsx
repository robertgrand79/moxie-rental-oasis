import React, { useState } from 'react';
import { Search, Settings, Palette, Globe, Code, Shield, Mail } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import GeneralInformationSettings from '@/components/admin/settings/GeneralInformationSettings';
import HeroSectionSettings from '@/components/admin/settings/HeroSectionSettings';
import ContactInformationSettings from '@/components/admin/settings/ContactInformationSettings';
import DesignBrandingTab from '@/components/admin/settings/DesignBrandingTab';
import SEOSettingsTab from '@/components/admin/settings/SEOSettingsTab';
import AnalyticsSettingsTab from '@/components/admin/settings/AnalyticsSettingsTab';
import MapsSettingsTab from '@/components/admin/settings/MapsSettingsTab';
import AdvancedSettingsTab from '@/components/admin/settings/AdvancedSettingsTab';
import { useSettingsData } from '@/hooks/useSettingsData';

const AdminSiteSettingsRedesigned = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    siteData,
    setSiteData,
    seoData,
    setSeoData,
    analyticsData,
    setAnalyticsData,
    mapboxToken,
    setMapboxToken,
    updateSetting,
    loading,
    error
  } = useSettingsData();

  const handleInputChange = (field: string, value: string) => {
    setSiteData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSiteData((prev: any) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    await updateSetting('siteName', siteData.siteName);
    await updateSetting('tagline', siteData.tagline);
    await updateSetting('description', siteData.description);
    await updateSetting('contactEmail', siteData.contactEmail);
    await updateSetting('phone', siteData.phone);
    await updateSetting('address', siteData.address);
    await updateSetting('socialMedia', siteData.socialMedia);
    setDialogOpen(false);
  };

  const settingsCategories = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic site information and preferences',
      icon: Settings,
      color: 'bg-blue-100 text-blue-700',
      settings: [
        { 
          name: 'Site Information', 
          description: 'Site name, tagline, and description', 
          status: siteData.siteName ? 'configured' : 'needs-setup',
          key: 'site-info'
        },
        { 
          name: 'Hero Section', 
          description: 'Homepage hero content and images', 
          status: siteData.heroTitle ? 'configured' : 'needs-setup',
          key: 'hero-section'
        },
        { 
          name: 'Contact Information', 
          description: 'Phone, email, address, and social media', 
          status: siteData.contactEmail ? 'configured' : 'needs-setup',
          key: 'contact-info'
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance & Branding',
      description: 'Colors, fonts, logo, and visual design',
      icon: Palette,
      color: 'bg-purple-100 text-purple-700',
      settings: [
        { 
          name: 'Design & Branding', 
          description: 'Colors, fonts, and visual elements', 
          status: 'configured',
          key: 'design-branding'
        }
      ]
    },
    {
      id: 'seo',
      title: 'SEO & Analytics',
      description: 'Search optimization and tracking',
      icon: Globe,
      color: 'bg-green-100 text-green-700',
      settings: [
        { 
          name: 'SEO Settings', 
          description: 'Meta tags and search optimization', 
          status: seoData.siteTitle ? 'configured' : 'needs-setup',
          key: 'seo-settings'
        },
        { 
          name: 'Analytics', 
          description: 'Google Analytics and tracking codes', 
          status: analyticsData.googleAnalyticsId ? 'configured' : 'needs-setup',
          key: 'analytics-settings'
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations & APIs',
      description: 'Third-party services and connections',
      icon: Code,
      color: 'bg-orange-100 text-orange-700',
      settings: [
        { 
          name: 'Maps Integration', 
          description: 'Mapbox for location features', 
          status: mapboxToken ? 'configured' : 'needs-setup',
          key: 'maps-settings'
        },
        { 
          name: 'Advanced Settings', 
          description: 'Custom CSS and JavaScript', 
          status: 'configured',
          key: 'advanced-settings'
        }
      ]
    }
  ];

  const filteredCategories = settingsCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.settings.some(setting => 
      setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const activeSettings = settingsCategories.find(cat => cat.id === activeCategory)?.settings || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <Badge variant="default" className="bg-green-100 text-green-700 text-xs">Configured</Badge>;
      case 'needs-setup':
        return <Badge variant="destructive" className="text-xs">Needs Setup</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  const handleSettingClick = (settingKey: string) => {
    setSelectedSetting(settingKey);
    setDialogOpen(true);
  };

  const renderSettingContent = () => {
    switch (selectedSetting) {
      case 'site-info':
        return (
          <GeneralInformationSettings
            siteData={siteData}
            onInputChange={handleInputChange}
            onSave={handleSaveSettings}
          />
        );
      case 'hero-section':
        return (
          <HeroSectionSettings
            siteData={siteData}
            onInputChange={handleInputChange}
            onSave={handleSaveSettings}
          />
        );
      case 'contact-info':
        return (
          <ContactInformationSettings
            siteData={siteData}
            onInputChange={handleInputChange}
            onSocialMediaChange={handleSocialMediaChange}
          />
        );
      case 'design-branding':
        return <DesignBrandingTab />;
      case 'seo-settings':
        return (
          <SEOSettingsTab
            seoData={seoData}
            setSeoData={setSeoData}
            onSave={async () => {
              await updateSetting('siteTitle', seoData.siteTitle);
              await updateSetting('metaDescription', seoData.metaDescription);
              setDialogOpen(false);
            }}
          />
        );
      case 'analytics-settings':
        return (
          <AnalyticsSettingsTab
            analyticsData={analyticsData}
            setAnalyticsData={setAnalyticsData}
            onSave={async () => {
              await updateSetting('googleAnalyticsId', analyticsData.googleAnalyticsId);
              setDialogOpen(false);
            }}
          />
        );
      case 'maps-settings':
        return (
          <MapsSettingsTab
            mapboxToken={mapboxToken}
            setMapboxToken={setMapboxToken}
            onSave={async () => {
              await updateSetting('mapboxToken', mapboxToken);
              setDialogOpen(false);
            }}
          />
        );
      case 'advanced-settings':
        return (
          <AdvancedSettingsTab
            analyticsData={analyticsData}
            setAnalyticsData={setAnalyticsData}
            updateSetting={updateSetting}
          />
        );
      default:
        return <div>Select a setting to configure</div>;
    }
  };

  if (loading) {
    return (
      <AdminPageWrapper
        title="Site Settings"
        description="Configure and customize your website settings"
      >
        <div className="p-8 text-center">
          <p>Loading settings...</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Site Settings"
      description="Configure and customize your website settings"
    >
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Search Section */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4 px-2">
                Categories
              </h3>
              {filteredCategories.map((category) => {
                const IconComponent = category.icon;
                const needsSetupCount = category.settings.filter(s => s.status === 'needs-setup').length;
                
                return (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-3 text-left relative",
                      activeCategory === category.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <div className="flex items-start gap-3 w-full min-w-0">
                      <div className={cn("p-1.5 rounded-md flex-shrink-0", category.color)}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm leading-tight mb-1 truncate">
                              {category.title}
                            </p>
                            <p className="text-xs opacity-75 leading-tight line-clamp-2">
                              {category.description}
                            </p>
                          </div>
                          {needsSetupCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="text-xs px-1.5 py-0.5 h-5 flex-shrink-0 mt-0.5"
                            >
                              {needsSetupCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Settings Details */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {filteredCategories.find(cat => cat.id === activeCategory) && (
              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                    {filteredCategories.find(cat => cat.id === activeCategory)?.title}
                  </h2>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {filteredCategories.find(cat => cat.id === activeCategory)?.description}
                  </p>
                </div>

                {/* Settings Cards */}
                <div className="grid gap-4">
                  {activeSettings.map((setting, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-2">
                            <CardTitle className="text-lg leading-tight">{setting.name}</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">
                              {setting.description}
                            </CardDescription>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(setting.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button 
                          variant={setting.status === 'needs-setup' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSettingClick(setting.key)}
                          className="w-full sm:w-auto"
                        >
                          {setting.status === 'needs-setup' ? 'Set Up' : 'Configure'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State */}
                {activeSettings.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <p className="text-base">No settings found for this category.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedSetting && activeSettings.find(s => s.key === selectedSetting)?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              {renderSettingContent()}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSiteSettingsRedesigned;
