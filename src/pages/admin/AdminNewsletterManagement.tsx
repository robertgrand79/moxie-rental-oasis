
import React from 'react';
import { TrendingUp } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewsletterManager from '@/components/NewsletterManager';
import NewsletterSubscribersList from '@/components/newsletter/NewsletterSubscribersList';
import NewsletterStatsCards from '@/components/admin/newsletter/NewsletterStatsCards';
import NewsletterCampaignsTable from '@/components/admin/newsletter/NewsletterCampaignsTable';
import NewsletterAnalyticsTab from '@/components/admin/newsletter/NewsletterAnalyticsTab';
import HospitableSyncCard from '@/components/admin/newsletter/HospitableSyncCard';
import { useNewsletterCampaigns } from '@/hooks/useNewsletterCampaigns';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';

const AdminNewsletterManagement = () => {
  const { campaigns, loading: campaignsLoading, deleting, deleteCampaign } = useNewsletterCampaigns();
  const { subscriberCount } = useNewsletterStats();

  // Calculate statistics from real data
  const sentCampaigns = campaigns.filter(campaign => campaign.sent_at);
  const totalRecipients = sentCampaigns.reduce((sum, campaign) => sum + campaign.recipient_count, 0);
  const avgRecipients = sentCampaigns.length > 0 ? Math.round(totalRecipients / sentCampaigns.length) : 0;

  const pageActions = (
    <div className="flex gap-2">
      <EnhancedButton 
        variant="outline"
        icon={<TrendingUp className="h-4 w-4" />}
      >
        View Analytics
      </EnhancedButton>
    </div>
  );

  return (
    <AdminPageWrapper
      title="Newsletter Management"
      description="Create, send, and manage your newsletter campaigns"
      actions={pageActions}
    >
      <div className="p-8">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="create">Create Newsletter</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="history">Newsletter History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <NewsletterManager />
          </TabsContent>

          <TabsContent value="subscribers">
            <NewsletterSubscribersList />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Guest Contact Integration</h3>
                <p className="text-gray-600 mb-4">
                  Automatically import guest contact information from your booking platforms to grow your newsletter audience.
                </p>
              </div>
              <HospitableSyncCard />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <NewsletterStatsCards
              sentCampaigns={sentCampaigns.length}
              avgRecipients={avgRecipients}
              subscriberCount={subscriberCount}
            />

            <NewsletterCampaignsTable
              campaigns={campaigns}
              loading={campaignsLoading}
              deleting={deleting}
              onDelete={deleteCampaign}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <NewsletterAnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminNewsletterManagement;
