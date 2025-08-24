import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewsletterViewToggle from './NewsletterViewToggle';
import NewslettersGrid from './NewslettersGrid';
import NewslettersList from './NewslettersList';

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  cover_image_url?: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsletterManagementViewProps {
  newsletters: Newsletter[];
  onEdit: (newsletter: Newsletter) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  deleting: string | null;
}

const NewsletterManagementView = ({ 
  newsletters, 
  onEdit, 
  onDelete, 
  onCreateNew, 
  deleting 
}: NewsletterManagementViewProps) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'drafts' | 'sent'>('all');

  // Filter newsletters based on selected filter
  const filteredNewsletters = newsletters.filter((newsletter) => {
    if (filter === 'drafts') return !newsletter.sent_at;
    if (filter === 'sent') return newsletter.sent_at;
    return true; // 'all'
  });

  // Count newsletters for each filter
  const allCount = newsletters.length;
  const draftsCount = newsletters.filter(n => !n.sent_at).length;
  const sentCount = newsletters.filter(n => n.sent_at).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Newsletter Management</h1>
          <p className="text-muted-foreground">Create, manage, and send your newsletter campaigns</p>
        </div>
        
        <div className="flex items-center gap-3">
          <NewsletterViewToggle view={view} onViewChange={setView} />
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Newsletter
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'drafts' | 'sent')}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="flex items-center gap-2">
            📧 All Newsletters
            {allCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-muted rounded-full text-xs">
                {allCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            🗂️ Drafts
            {draftsCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-muted rounded-full text-xs">
                {draftsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            ✅ Sent
            {sentCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-muted rounded-full text-xs">
                {sentCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {view === 'grid' ? (
            <NewslettersGrid
              newsletters={filteredNewsletters}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateNew={onCreateNew}
              deleting={deleting}
            />
          ) : (
            <NewslettersList
              newsletters={filteredNewsletters}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateNew={onCreateNew}
              deleting={deleting}
            />
          )}
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          {view === 'grid' ? (
            <NewslettersGrid
              newsletters={filteredNewsletters}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateNew={onCreateNew}
              deleting={deleting}
            />
          ) : (
            <NewslettersList
              newsletters={filteredNewsletters}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateNew={onCreateNew}
              deleting={deleting}
            />
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {view === 'grid' ? (
            <NewslettersGrid
              newsletters={filteredNewsletters}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateNew={onCreateNew}
              deleting={deleting}
            />
          ) : (
            <NewslettersList
              newsletters={filteredNewsletters}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateNew={onCreateNew}
              deleting={deleting}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsletterManagementView;