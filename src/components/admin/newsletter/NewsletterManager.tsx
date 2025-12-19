import React, { useState, useMemo } from 'react';
import { useNewsletterCampaigns } from '@/hooks/useNewsletterCampaigns';
import ModernNewslettersHeader from './ModernNewslettersHeader';
import NewslettersGrid from './NewslettersGrid';
import NewslettersListView from './NewslettersListView';
import NewsletterForm from './NewsletterForm';

const NewsletterManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { campaigns, loading, deleting, deleteCampaign, refetch } = useNewsletterCampaigns();

  // Calculate stats
  const stats = useMemo(() => {
    const total = campaigns.length;
    const sent = campaigns.filter(c => c.sent_at).length;
    const draft = campaigns.filter(c => !c.sent_at).length;
    const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipient_count || 0), 0);
    
    return { total, sent, draft, totalRecipients };
  }, [campaigns]);

  // Filter newsletters
  const filteredNewsletters = useMemo(() => {
    let result = campaigns;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.subject.toLowerCase().includes(query) ||
        c.content.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => 
        statusFilter === 'sent' ? c.sent_at : !c.sent_at
      );
    }

    return result;
  }, [campaigns, searchQuery, statusFilter]);

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
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <div className="bg-card rounded-xl p-4 border shadow-sm animate-pulse">
          <div className="h-10 bg-muted rounded" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModernNewslettersHeader
        totalNewsletters={stats.total}
        sentNewsletters={stats.sent}
        draftNewsletters={stats.draft}
        totalRecipients={stats.totalRecipients}
        onAddNewsletter={handleAddNew}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refetch}
      />

      {viewMode === 'grid' ? (
        <NewslettersGrid 
          newsletters={filteredNewsletters}
          onEdit={handleEdit}
          onDelete={deleteCampaign}
          onCreateNew={handleAddNew}
          deleting={deleting}
        />
      ) : (
        <NewslettersListView 
          newsletters={filteredNewsletters}
          onEdit={handleEdit}
          onDelete={deleteCampaign}
          onCreateNew={handleAddNew}
          deleting={deleting}
        />
      )}

      {isFormOpen && (
        <NewsletterForm
          newsletter={editingNewsletter}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default NewsletterManager;
