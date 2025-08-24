import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Settings, History, Zap } from 'lucide-react';
import StreamlinedNewsletterEditor from './StreamlinedNewsletterEditor';
import NewsletterSubscribersList from './NewsletterSubscribersList';
import NewsletterStatsCards from '@/components/admin/newsletter/NewsletterStatsCards';
import NewsletterCampaignsTable from '@/components/admin/newsletter/NewsletterCampaignsTable';
import NewsletterOverview from '@/components/NewsletterOverview';
import NewslettersGrid from '@/components/admin/newsletter/NewslettersGrid';
import NewsletterAnalyticsTab from '@/components/admin/newsletter/NewsletterAnalyticsTab';
import HospitableSyncCard from '@/components/admin/newsletter/HospitableSyncCard';
import NewsletterSMSCard from '../NewsletterSMSCard';
import GlobalNewsletterSettings from '@/components/admin/newsletter/GlobalNewsletterSettings';
import { useNewsletterCampaigns } from '@/hooks/useNewsletterCampaigns';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';

const NewsletterManagementTabs = () => {
  const [activeTab, setActiveTab] = useState("create");
  const { campaigns, loading: campaignsLoading, deleting, deleteCampaign } = useNewsletterCampaigns();
  const { subscriberCount } = useNewsletterStats();

  // Listen for reset event from parent
  useEffect(() => {
    const handleReset = () => {
      setActiveTab("create");
    };

    window.addEventListener('resetNewsletterTabs', handleReset);
    return () => window.removeEventListener('resetNewsletterTabs', handleReset);
  }, []);

  // Calculate statistics from real data
  const sentCampaigns = campaigns.filter(campaign => campaign.sent_at);
  const totalRecipients = sentCampaigns.reduce((sum, campaign) => sum + campaign.recipient_count, 0);
  const avgRecipients = sentCampaigns.length > 0 ? Math.round(totalRecipients / sentCampaigns.length) : 0;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 h-12">
        <TabsTrigger value="create" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </TabsTrigger>
        <TabsTrigger value="subscribers" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Subscribers</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Newsletter Overview</h2>
          <p className="text-muted-foreground">Monitor your newsletter performance and create new campaigns</p>
        </div>
        
        <NewsletterOverview subscriberCount={subscriberCount} />
        
        <StreamlinedNewsletterEditor />
      </TabsContent>

      <TabsContent value="subscribers" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Subscriber Management</h2>
          <p className="text-muted-foreground">Manage your newsletter subscribers and import new contacts</p>
        </div>
        <NewsletterSubscribersList />
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Newsletter History</h2>
          <p className="text-muted-foreground">View and manage your sent newsletters</p>
        </div>
        
        <NewsletterStatsCards
          sentCampaigns={sentCampaigns.length}
          avgRecipients={avgRecipients}
          subscriberCount={subscriberCount}
        />

        <NewslettersGrid
          newsletters={campaigns}
          deleting={deleting}
          onEdit={() => {}}
          onDelete={deleteCampaign}
          onCreateNew={() => setActiveTab("create")}
        />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Newsletter Analytics</h2>
          <p className="text-muted-foreground">Track performance and engagement metrics</p>
        </div>
        <NewsletterAnalyticsTab />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Newsletter Settings</h2>
          <p className="text-muted-foreground">Configure branding, integrations, and other newsletter settings</p>
        </div>
        
        <div className="space-y-6">
          <GlobalNewsletterSettings />
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Guest Contact Integration</h3>
                <p className="text-muted-foreground mb-4">
                  Automatically import guest contact information from your booking platforms.
                </p>
                <HospitableSyncCard />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">SMS Notifications</h3>
                <p className="text-muted-foreground mb-4">
                  Set up SMS notifications for your newsletter campaigns.
                </p>
                <NewsletterSMSCard />
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default NewsletterManagementTabs;