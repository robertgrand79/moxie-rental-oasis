import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlatformAdmin, PlatformOrganization } from '@/hooks/usePlatformAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  OrganizationCard, 
  OrganizationsFilterToolbar,
  StatusFilter,
  TypeFilter,
  SubscriptionFilter,
  SortOption
} from '@/components/admin/superadmin/organizations';
import CreateOrganizationDialog from '@/components/admin/superadmin/CreateOrganizationDialog';
import { Skeleton } from '@/components/ui/skeleton';

const PlatformOrganizationsPage = () => {
  const [searchParams] = useSearchParams();
  const { 
    organizations, 
    loadingOrgs, 
    showArchived,
    setShowArchived,
    toggleOrgStatus,
    toggleTemplateStatus,
    updateTemplateType,
    archiveOrganization,
    restoreOrganization,
    deleteOrganization,
    isUpdating,
    refetchOrgs
  } = usePlatformAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [showCreateDialog, setShowCreateDialog] = useState(searchParams.get('action') === 'create');

  // Filter and sort organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations || [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(term) ||
        org.slug.toLowerCase().includes(term) ||
        org.custom_domain?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => {
        const isArchived = !!org.archived_at;
        switch (statusFilter) {
          case 'active':
            return org.is_active && !isArchived;
          case 'inactive':
            return !org.is_active && !isArchived;
          case 'archived':
            return isArchived;
          default:
            return true;
        }
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(org => {
        switch (typeFilter) {
          case 'template':
            return org.is_template;
          case 'business':
            return !org.is_template;
          default:
            return true;
        }
      });
    }

    // Subscription filter
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(org => org.subscription_status === subscriptionFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'members':
          return (b.member_count || 0) - (a.member_count || 0);
        case 'properties':
          return (b.property_count || 0) - (a.property_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [organizations, searchTerm, statusFilter, typeFilter, subscriptionFilter, sortBy]);

  // Count stats for header
  const stats = useMemo(() => {
    const all = organizations || [];
    return {
      total: all.length,
      active: all.filter(o => o.is_active && !o.archived_at).length,
      trialing: all.filter(o => o.subscription_status === 'trialing').length,
      templates: all.filter(o => o.is_template).length
    };
  }, [organizations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            {stats.total} total · {stats.active} active · {stats.trialing} trialing · {stats.templates} templates
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <OrganizationsFilterToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        subscriptionFilter={subscriptionFilter}
        setSubscriptionFilter={setSubscriptionFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        onCreateClick={() => setShowCreateDialog(true)}
      />

      {/* Organizations List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {filteredOrganizations.length === (organizations?.length || 0) 
              ? `All Organizations (${filteredOrganizations.length})`
              : `Filtered Results (${filteredOrganizations.length} of ${organizations?.length || 0})`
            }
          </CardTitle>
          <CardDescription>
            Click on an organization to expand and view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOrgs ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrganizations.map(org => (
                <OrganizationCard
                  key={org.id}
                  org={org}
                  isUpdating={isUpdating}
                  toggleOrgStatus={toggleOrgStatus}
                  toggleTemplateStatus={toggleTemplateStatus}
                  updateTemplateType={updateTemplateType}
                  archiveOrganization={archiveOrganization}
                  restoreOrganization={restoreOrganization}
                  deleteOrganization={deleteOrganization}
                  refetchOrgs={refetchOrgs}
                />
              ))}
              {filteredOrganizations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || subscriptionFilter !== 'all'
                    ? 'No organizations match your filters' 
                    : 'No organizations found'
                  }
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateOrganizationDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          refetchOrgs?.();
        }}
      />
    </div>
  );
};

export default PlatformOrganizationsPage;
