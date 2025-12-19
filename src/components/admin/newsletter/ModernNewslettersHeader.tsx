import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Mail,
  Send,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Clock,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModernNewslettersHeaderProps {
  totalNewsletters: number;
  sentNewsletters: number;
  draftNewsletters: number;
  totalRecipients: number;
  onAddNewsletter: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRefresh: () => void;
}

const ModernNewslettersHeader = ({
  totalNewsletters,
  sentNewsletters,
  draftNewsletters,
  totalRecipients,
  onAddNewsletter,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh,
}: ModernNewslettersHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Title, Stats, and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Newsletters</h1>
          {/* Inline Stats */}
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span className="font-medium text-foreground">{totalNewsletters}</span> Total
            </span>
            <span className="flex items-center gap-1.5">
              <Send className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">{sentNewsletters}</span> Sent
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-600">{draftNewsletters}</span> Draft
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">{totalRecipients}</span> Total Recipients
            </span>
          </div>
        </div>
        <Button onClick={onAddNewsletter} className="shrink-0">
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
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
                onClick={() => onViewModeChange('grid')}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 w-8 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernNewslettersHeader;
