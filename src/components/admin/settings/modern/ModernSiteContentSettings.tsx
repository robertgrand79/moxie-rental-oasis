import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Users, 
  Phone, 
  Search, 
  BarChart,
  RefreshCw,
  Settings,
  CheckCircle2,
  Pencil
} from 'lucide-react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import SEOSettingsDrawer from './drawers/SEOSettingsDrawer';
import AnalyticsSettingsDrawer from './drawers/AnalyticsSettingsDrawer';
import SiteInfoDrawer from './drawers/SiteInfoDrawer';
import HeroSettingsDrawer from './drawers/HeroSettingsDrawer';
import ContactSettingsDrawer from './drawers/ContactSettingsDrawer';
import AboutSettingsDrawer from './drawers/AboutSettingsDrawer';

interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  configured?: boolean;
  onClick: () => void;
}

const SettingCard: React.FC<SettingCardProps> = ({ icon, title, description, configured, onClick }) => (
  <Card 
    className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {title}
              {configured && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </CardContent>
  </Card>
);

const ModernSiteContentSettings: React.FC = () => {
  const { settings, loading } = useSimplifiedSiteSettings();
  
  const [seoDrawerOpen, setSeoDrawerOpen] = useState(false);
  const [analyticsDrawerOpen, setAnalyticsDrawerOpen] = useState(false);
  const [siteInfoDrawerOpen, setSiteInfoDrawerOpen] = useState(false);
  const [heroDrawerOpen, setHeroDrawerOpen] = useState(false);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [aboutDrawerOpen, setAboutDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check configuration status
  const hasSiteInfo = !!(settings?.siteName || settings?.description);
  const hasHero = !!(settings?.heroTitle || settings?.heroSubtitle);
  const hasContact = !!(settings?.contactEmail || settings?.phone);
  const hasAbout = !!(settings?.founderNames || settings?.missionStatement);
  const hasSEO = !!(settings?.heroTitle); // Simplified check
  const hasAnalytics = !!(settings?.googleAnalyticsId);

  const configuredCount = [hasSiteInfo, hasHero, hasContact, hasAbout, hasSEO, hasAnalytics].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Site & Content</h1>
            <p className="text-muted-foreground">Manage your site information and content</p>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSeoDrawerOpen(true)}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            SEO
            {hasSEO && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAnalyticsDrawerOpen(true)}
            className="gap-2"
          >
            <BarChart className="h-4 w-4" />
            Analytics
            {hasAnalytics && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Inline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{configuredCount}/6</p>
              <p className="text-xs text-muted-foreground">Sections Configured</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{hasSEO ? 'Yes' : 'No'}</p>
              <p className="text-xs text-muted-foreground">SEO Configured</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BarChart className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{hasAnalytics ? 'Active' : 'Off'}</p>
              <p className="text-xs text-muted-foreground">Analytics</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Setting Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <SettingCard
          icon={<FileText className="h-5 w-5 text-primary" />}
          title="Site Info"
          description="Name, tagline, and description"
          configured={hasSiteInfo}
          onClick={() => setSiteInfoDrawerOpen(true)}
        />
        <SettingCard
          icon={<Image className="h-5 w-5 text-primary" />}
          title="Hero Section"
          description="Title, subtitle, and call-to-action"
          configured={hasHero}
          onClick={() => setHeroDrawerOpen(true)}
        />
        <SettingCard
          icon={<Phone className="h-5 w-5 text-primary" />}
          title="Contact"
          description="Email, phone, and address"
          configured={hasContact}
          onClick={() => setContactDrawerOpen(true)}
        />
        <SettingCard
          icon={<Users className="h-5 w-5 text-primary" />}
          title="About Page"
          description="Mission, story, and team"
          configured={hasAbout}
          onClick={() => setAboutDrawerOpen(true)}
        />
      </div>

      {/* Drawers */}
      <SEOSettingsDrawer open={seoDrawerOpen} onOpenChange={setSeoDrawerOpen} />
      <AnalyticsSettingsDrawer open={analyticsDrawerOpen} onOpenChange={setAnalyticsDrawerOpen} />
      <SiteInfoDrawer open={siteInfoDrawerOpen} onOpenChange={setSiteInfoDrawerOpen} />
      <HeroSettingsDrawer open={heroDrawerOpen} onOpenChange={setHeroDrawerOpen} />
      <ContactSettingsDrawer open={contactDrawerOpen} onOpenChange={setContactDrawerOpen} />
      <AboutSettingsDrawer open={aboutDrawerOpen} onOpenChange={setAboutDrawerOpen} />
    </div>
  );
};

export default ModernSiteContentSettings;
