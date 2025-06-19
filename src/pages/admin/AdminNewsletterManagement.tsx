
import React from 'react';
import { Plus, Mail, Eye, Edit, Trash2, Users, TrendingUp } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import NewsletterManager from '@/components/NewsletterManager';
import NewsletterSubscribersList from '@/components/newsletter/NewsletterSubscribersList';
import { useNewsletterCampaigns } from '@/hooks/useNewsletterCampaigns';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';

const AdminNewsletterManagement = () => {
  const { campaigns, loading: campaignsLoading } = useNewsletterCampaigns();
  const { subscriberCount } = useNewsletterStats();

  const handleViewNewsletter = (id: string) => {
    console.log('View newsletter:', id);
    // TODO: Implement newsletter preview modal
  };

  const handleEditNewsletter = (id: string) => {
    console.log('Edit newsletter:', id);
    // TODO: Implement newsletter editing
  };

  const handleDeleteNewsletter = (id: string) => {
    console.log('Delete newsletter:', id);
    // TODO: Implement newsletter deletion
  };

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create Newsletter</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="history">Newsletter History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <NewsletterManager />
          </TabsContent>

          <TabsContent value="subscribers">
            <NewsletterSubscribersList />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sentCampaigns.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Newsletter campaigns
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Recipients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgRecipients}</div>
                  <p className="text-xs text-muted-foreground">
                    Per campaign
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscriberCount || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active subscribers
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sent Newsletters</CardTitle>
                <CardDescription>
                  View and manage your sent newsletter campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No newsletters have been sent yet</p>
                    <p className="text-sm">Create and send your first newsletter from the Create Newsletter tab</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Sent Date</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.subject}</TableCell>
                          <TableCell>
                            {campaign.sent_at 
                              ? new Date(campaign.sent_at).toLocaleDateString() 
                              : 'Not sent'
                            }
                          </TableCell>
                          <TableCell>{campaign.recipient_count}</TableCell>
                          <TableCell>
                            <Badge variant={campaign.sent_at ? "default" : "secondary"}>
                              {campaign.sent_at ? "Sent" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewNewsletter(campaign.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!campaign.sent_at && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditNewsletter(campaign.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNewsletter(campaign.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Analytics</CardTitle>
                <CardDescription>
                  Detailed performance metrics for your newsletter campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Detailed analytics dashboard coming soon</p>
                  <p className="text-sm">Email tracking for opens, clicks, and conversions will be available in a future update</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminNewsletterManagement;
