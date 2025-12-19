import React, { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List, RefreshCw, Mail, Send, Clock, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NewslettersGrid from './NewslettersGrid';
import NewslettersListView from './NewslettersListView';

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
  onRefresh?: () => void;
  deleting: string | null;
}

const NewsletterManagementView = ({ 
  newsletters, 
  onEdit, 
  onDelete, 
  onCreateNew,
  onRefresh,
  deleting 
}: NewsletterManagementViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate stats
  const stats = useMemo(() => {
    const total = newsletters.length;
    const sent = newsletters.filter(n => n.sent_at).length;
    const draft = newsletters.filter(n => !n.sent_at).length;
    const totalRecipients = newsletters.reduce((sum, n) => sum + (n.recipient_count || 0), 0);
    
    return { total, sent, draft, totalRecipients };
  }, [newsletters]);

  // Filter newsletters
  const filteredNewsletters = useMemo(() => {
    let result = newsletters;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.subject.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(n => 
        statusFilter === 'sent' ? n.sent_at : !n.sent_at
      );
    }

    return result;
  }, [newsletters, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="space-y-4">
        {/* Title, Stats, and Action */}
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
                <span className="font-medium text-blue-600">{stats.totalRecipients}</span> Total Recipients
              </span>
            </div>
          </div>
          <Button onClick={onCreateNew} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Newsletter
          </Button>
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
              
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 w-8 p-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <NewslettersGrid
          newsletters={filteredNewsletters}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateNew={onCreateNew}
          deleting={deleting}
        />
      ) : (
        <NewslettersListView
          newsletters={filteredNewsletters}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateNew={onCreateNew}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default NewsletterManagementView;
