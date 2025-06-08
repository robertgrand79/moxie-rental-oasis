
import React, { useState } from 'react';
import { Search, Settings, Palette, Globe, Code, Shield, Mail } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AdminSiteSettingsRedesigned = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');

  const settingsCategories = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic site information and preferences',
      icon: Settings,
      color: 'bg-blue-100 text-blue-700',
      settings: [
        { name: 'Site Name', description: 'Your website title', status: 'configured' },
        { name: 'Site Description', description: 'Brief description of your site', status: 'configured' },
        { name: 'Contact Information', description: 'Phone, email, address', status: 'configured' },
        { name: 'Time Zone', description: 'Default timezone for your site', status: 'needs-setup' }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance & Branding',
      description: 'Colors, fonts, logo, and visual design',
      icon: Palette,
      color: 'bg-purple-100 text-purple-700',
      settings: [
        { name: 'Logo & Favicon', description: 'Upload your brand assets', status: 'configured' },
        { name: 'Color Scheme', description: 'Primary and secondary colors', status: 'configured' },
        { name: 'Typography', description: 'Font choices and sizing', status: 'needs-setup' },
        { name: 'Hero Section', description: 'Homepage hero content and images', status: 'configured' }
      ]
    },
    {
      id: 'seo',
      title: 'SEO & Analytics',
      description: 'Search optimization and tracking',
      icon: Globe,
      color: 'bg-green-100 text-green-700',
      settings: [
        { name: 'Meta Tags', description: 'Default SEO meta descriptions', status: 'configured' },
        { name: 'Google Analytics', description: 'Website traffic tracking', status: 'needs-setup' },
        { name: 'Google Search Console', description: 'Search performance monitoring', status: 'needs-setup' },
        { name: 'Social Media Cards', description: 'Open Graph and Twitter cards', status: 'configured' }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations & APIs',
      description: 'Third-party services and connections',
      icon: Code,
      color: 'bg-orange-100 text-orange-700',
      settings: [
        { name: 'Hospitable Integration', description: 'Property management sync', status: 'configured' },
        { name: 'Email Service', description: 'Newsletter and transactional emails', status: 'configured' },
        { name: 'Maps Integration', description: 'Mapbox for location features', status: 'needs-setup' },
        { name: 'AI Tools', description: 'OpenAI API configuration', status: 'configured' }
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'User access and data protection',
      icon: Shield,
      color: 'bg-red-100 text-red-700',
      settings: [
        { name: 'User Permissions', description: 'Role-based access control', status: 'configured' },
        { name: 'Privacy Policy', description: 'Data handling disclosure', status: 'needs-setup' },
        { name: 'Cookie Consent', description: 'GDPR compliance settings', status: 'needs-setup' },
        { name: 'Backup Settings', description: 'Data backup configuration', status: 'configured' }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      description: 'Email alerts and system notifications',
      icon: Mail,
      color: 'bg-teal-100 text-teal-700',
      settings: [
        { name: 'Admin Notifications', description: 'System alerts and updates', status: 'configured' },
        { name: 'Newsletter Settings', description: 'Subscriber management', status: 'configured' },
        { name: 'Booking Alerts', description: 'Property reservation notifications', status: 'needs-setup' },
        { name: 'Error Monitoring', description: 'System error alerts', status: 'needs-setup' }
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
        return <Badge variant="default" className="bg-green-100 text-green-700">Configured</Badge>;
      case 'needs-setup':
        return <Badge variant="destructive">Needs Setup</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <AdminPageWrapper
      title="Site Settings"
      description="Configure and customize your website settings"
    >
      <div className="p-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">
              Settings Categories
            </h3>
            {filteredCategories.map((category) => {
              const IconComponent = category.icon;
              const needsSetupCount = category.settings.filter(s => s.status === 'needs-setup').length;
              
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-3 text-left",
                    activeCategory === category.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={cn("p-1 rounded", category.color)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{category.title}</p>
                        {needsSetupCount > 0 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {needsSetupCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-1">{category.description}</p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Settings Details */}
          <div className="lg:col-span-3">
            {filteredCategories.find(cat => cat.id === activeCategory) && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {filteredCategories.find(cat => cat.id === activeCategory)?.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredCategories.find(cat => cat.id === activeCategory)?.description}
                  </p>
                </div>

                <div className="grid gap-4">
                  {activeSettings.map((setting, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{setting.name}</CardTitle>
                          {getStatusBadge(setting.status)}
                        </div>
                        <CardDescription>{setting.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button 
                          variant={setting.status === 'needs-setup' ? 'default' : 'outline'}
                          size="sm"
                        >
                          {setting.status === 'needs-setup' ? 'Set Up' : 'Configure'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {activeSettings.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No settings found for this category.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSiteSettingsRedesigned;
