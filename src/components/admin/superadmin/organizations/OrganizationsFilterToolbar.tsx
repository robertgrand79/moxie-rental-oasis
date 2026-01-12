import React from 'react';
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
  Search,
  Archive,
  Plus,
  LayoutGrid,
  List,
  X
} from 'lucide-react';

export type StatusFilter = 'all' | 'active' | 'inactive' | 'archived';
export type TypeFilter = 'all' | 'business' | 'template';
export type SubscriptionFilter = 'all' | 'trialing' | 'active' | 'canceled' | 'comped' | 'past_due';
export type SortOption = 'name' | 'created' | 'members' | 'properties';
export type ViewMode = 'cards' | 'compact';

interface OrganizationsFilterToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (value: TypeFilter) => void;
  subscriptionFilter: SubscriptionFilter;
  setSubscriptionFilter: (value: SubscriptionFilter) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  showArchived: boolean;
  setShowArchived: (value: boolean) => void;
  onCreateClick: () => void;
}

const OrganizationsFilterToolbar: React.FC<OrganizationsFilterToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  subscriptionFilter,
  setSubscriptionFilter,
  sortBy,
  setSortBy,
  showArchived,
  setShowArchived,
  onCreateClick
}) => {
  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || subscriptionFilter !== 'all' || searchTerm;
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSubscriptionFilter('all');
  };

  return (
    <div className="space-y-3">
      {/* Primary Row: Search + Create */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={onCreateClick} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Secondary Row: Filters + Sort */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="template">Template</SelectItem>
          </SelectContent>
        </Select>

        {/* Subscription Filter */}
        <Select value={subscriptionFilter} onValueChange={(v) => setSubscriptionFilter(v as SubscriptionFilter)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscriptions</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="comped">Comped</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="created">Newest First</SelectItem>
            <SelectItem value="members">Most Members</SelectItem>
            <SelectItem value="properties">Most Properties</SelectItem>
          </SelectContent>
        </Select>

        {/* Show Archived Toggle */}
        <Button
          variant={showArchived ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="h-9"
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? 'Showing Archived' : 'Show Archived'}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrganizationsFilterToolbar;
