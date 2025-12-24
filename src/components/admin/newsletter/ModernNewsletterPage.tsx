import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  RefreshCw, 
  Mail, 
  Send, 
  Clock, 
  Users, 
  Search,
  TrendingUp,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import NewslettersGrid from './NewslettersGrid';
import NewslettersListView from './NewslettersListView';
import NewsletterSubscribersDrawer from './dialogs/NewsletterSubscribersDrawer';
import NewsletterAnalyticsDrawer from './dialogs/NewsletterAnalyticsDrawer';
import NewsletterSettingsDrawer from './dialogs/NewsletterSettingsDrawer';
import NewsletterEditorDrawer from './dialogs/NewsletterEditorDrawer';
import { useNewsletterCampaigns } from '@/hooks/useNewsletterCampaigns';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';

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

const ModernNewsletterPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Drawer states
  const [subscribersOpen, setSubscribersOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);

  const { campaigns, loading, deleting, deleteCampaign, refetch } = useNewsletterCampaigns();
  const { subscriberCount } = useNewsletterStats();

  // Listen for reset event
  useEffect(() => {
    const handleReset = () => {
      setSubscribersOpen(false);
      setAnalyticsOpen(false);
      setSettingsOpen(false);
      setEditorOpen(false);
      setEditingNewsletter(null);
      setSearchQuery('');
      setStatusFilter('all');
    };

    window.addEventListener('resetNewsletterTabs', handleReset);
    return () => window.removeEventListener('resetNewsletterTabs', handleReset);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = campaigns.length;
    const sent = campaigns.filter(n => n.sent_at).length;
    const draft = campaigns.filter(n => !n.sent_at).length;
    const totalRecipients = campaigns.reduce((sum, n) => sum + (n.recipient_count || 0), 0);
    
    return { total, sent, draft, totalRecipients };
  }, [campaigns]);

  // Filter newsletters
  const filteredNewsletters = useMemo(() => {
    let result = campaigns;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.subject.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(n => 
        statusFilter === 'sent' ? n.sent_at : !n.sent_at
      );
    }

    return result;
  }, [campaigns, searchQuery, statusFilter]);

  const handleCreateNew = useCallback(() => {
    setEditingNewsletter(null);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setEditorOpen(true);
  }, []);

  const handleEditorClose = useCallback(() => {
    setEditingNewsletter(null);
    setEditorOpen(false);
    refetch(); // Refresh the list after editing
  }, [refetch]);

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="space-y-4">
        {/* Title, Stats, and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Newsletters</h1>
            {/* Inline Stats */}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span className="font-medium text-foreground">{stats.total}</span> Total
              </span>
              <span className="flex items-center gap-1.5">
                <Send className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">{stats.sent}</span> Sent
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-600">{stats.draft}</span> Draft
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">{stats.totalRecipients}</span> Recipients
              </span>
            </div>
          </div>
          
          {/* Right side: Secondary actions + Create */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSubscribersOpen(true)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Subscribers</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setAnalyticsOpen(true)}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Analytics</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button onClick={handleCreateNew} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Newsletter
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Left side: Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search newsletters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right side: View Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={refetch} className="h-8 w-8 p-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <NewslettersGrid
          newsletters={filteredNewsletters}
          onEdit={handleEdit}
          onDelete={deleteCampaign}
          onCreateNew={handleCreateNew}
          deleting={deleting}
        />
      ) : (
        <NewslettersListView
          newsletters={filteredNewsletters}
          onEdit={handleEdit}
          onDelete={deleteCampaign}
          onCreateNew={handleCreateNew}
          deleting={deleting}
        />
      )}

      {/* Drawers */}
      <NewsletterSubscribersDrawer 
        open={subscribersOpen} 
        onOpenChange={setSubscribersOpen} 
      />
      <NewsletterAnalyticsDrawer 
        open={analyticsOpen} 
        onOpenChange={setAnalyticsOpen} 
      />
      <NewsletterSettingsDrawer 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
      <NewsletterEditorDrawer 
        open={editorOpen} 
        onOpenChange={setEditorOpen}
        newsletter={editingNewsletter}
        onClose={handleEditorClose}
      />
    </div>
  );
};

export default ModernNewsletterPage;
