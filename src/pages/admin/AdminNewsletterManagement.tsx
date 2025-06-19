
import React, { useState } from 'react';
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

const AdminNewsletterManagement = () => {
  const [newsletterHistory] = useState([
    {
      id: 1,
      subject: 'Welcome to Eugene - Your Local Guide',
      sentDate: '2024-01-15',
      recipients: 150,
      openRate: '68%',
      clickRate: '12%',
      status: 'Sent'
    },
    {
      id: 2,
      subject: 'New Property Added: Downtown Loft',
      sentDate: '2024-01-10',
      recipients: 142,
      openRate: '72%',
      clickRate: '18%',
      status: 'Sent'
    },
    {
      id: 3,
      subject: 'January Events in Eugene',
      sentDate: '2024-01-05',
      recipients: 138,
      openRate: '65%',
      clickRate: '15%',
      status: 'Sent'
    }
  ]);

  const handleViewNewsletter = (id: number) => {
    console.log('View newsletter:', id);
  };

  const handleEditNewsletter = (id: number) => {
    console.log('Edit newsletter:', id);
  };

  const handleDeleteNewsletter = (id: number) => {
    console.log('Delete newsletter:', id);
  };

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
                  <div className="text-2xl font-bold">{newsletterHistory.length}</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68.3%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.5% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">150</div>
                  <p className="text-xs text-muted-foreground">
                    +8 new this month
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Open Rate</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletterHistory.map((newsletter) => (
                      <TableRow key={newsletter.id}>
                        <TableCell className="font-medium">{newsletter.subject}</TableCell>
                        <TableCell>{newsletter.sentDate}</TableCell>
                        <TableCell>{newsletter.recipients}</TableCell>
                        <TableCell>{newsletter.openRate}</TableCell>
                        <TableCell>{newsletter.clickRate}</TableCell>
                        <TableCell>
                          <Badge variant="default">{newsletter.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewNewsletter(newsletter.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNewsletter(newsletter.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNewsletter(newsletter.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <p className="text-sm">Track opens, clicks, conversions, and subscriber growth</p>
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
