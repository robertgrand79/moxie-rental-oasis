import React, { useState } from 'react';
import { Plus, Mail, PenTool, Archive, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNewsletterCampaigns } from '@/hooks/useNewsletterCampaigns';
import NewslettersGrid from './NewslettersGrid';
import NewslettersListView from './NewslettersListView';
import NewsletterViewToggle from './NewsletterViewToggle';
import NewsletterForm from './NewsletterForm';

const NewsletterManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const { campaigns, loading, deleting, deleteCampaign } = useNewsletterCampaigns();

  const statusCategories = [
    { value: 'all', label: 'All Newsletters', icon: Mail },
    { value: 'draft', label: 'Drafts', icon: PenTool },
    { value: 'sent', label: 'Sent', icon: CheckCircle },
  ];

  const filteredNewsletters = selectedStatus === 'all' 
    ? campaigns 
    : campaigns.filter(campaign => 
        selectedStatus === 'sent' ? campaign.sent_at : !campaign.sent_at
      );

  const handleEdit = (newsletter: any) => {
    setEditingNewsletter(newsletter);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingNewsletter(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNewsletter(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold">Newsletter Management</CardTitle>
              <p className="text-muted-foreground">
                Create, manage, and send your newsletter campaigns
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NewsletterViewToggle view={view} onViewChange={setView} />
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Newsletter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-3 h-auto">
              {statusCategories.map((category) => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex items-center justify-center gap-2 px-2 py-3 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <category.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-6">
              {view === 'grid' ? (
                <NewslettersGrid 
                  newsletters={filteredNewsletters}
                  onEdit={handleEdit}
                  onDelete={deleteCampaign}
                  deleting={deleting}
                />
              ) : (
                <NewslettersListView 
                  newsletters={filteredNewsletters}
                  onEdit={handleEdit}
                  onDelete={deleteCampaign}
                  deleting={deleting}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isFormOpen && (
        <NewsletterForm
          newsletter={editingNewsletter}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
};

export default NewsletterManager;