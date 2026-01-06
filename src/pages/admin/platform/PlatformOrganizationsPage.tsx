import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlatformAdmin, PlatformOrganization, TemplateType } from '@/hooks/usePlatformAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Users, 
  Home, 
  Search,
  ExternalLink,
  Clock,
  Globe,
  Building,
  Plus,
  Archive
} from 'lucide-react';
import SubscriptionControls from '@/components/admin/superadmin/SubscriptionControls';
import CreateOrganizationDialog from '@/components/admin/superadmin/CreateOrganizationDialog';
import TenantDetailView from '@/components/admin/superadmin/TenantDetailView';
import OrganizationActionsMenu from '@/components/admin/superadmin/OrganizationActionsMenu';
import { format } from 'date-fns';

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
  const [showCreateDialog, setShowCreateDialog] = useState(searchParams.get('action') === 'create');
  const [selectedOrgForDetail, setSelectedOrgForDetail] = useState<string | null>(null);

  const filteredOrganizations = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.custom_domain?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const OrganizationRow = ({ org }: { org: PlatformOrganization }) => {
    const isArchived = !!org.archived_at;
    
    return (
      <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${isArchived ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            {org.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="h-10 w-10 object-contain rounded" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{org.name}</h3>
              {isArchived && (
                <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                  <Archive className="h-3 w-3" />
                  Archived
                </Badge>
              )}
              {org.is_template && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {org.template_type === 'single_property' ? (
                    <Home className="h-3 w-3" />
                  ) : (
                    <Building className="h-3 w-3" />
                  )}
                  {org.template_type === 'single_property' ? 'Single' : 'Multi'} Template
                </Badge>
              )}
              {!org.is_active && !isArchived && (
                <Badge variant="destructive">Inactive</Badge>
              )}
              {!org.onboarding_completed && !isArchived && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Onboarding
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a 
                href={`/${org.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary hover:underline transition-colors"
              >
                <Globe className="h-3 w-3" />
                {org.slug}
                <ExternalLink className="h-3 w-3" />
              </a>
              {org.custom_domain && (
                <a 
                  href={`https://${org.custom_domain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary hover:underline transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  {org.custom_domain}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {org.member_count} members
              </span>
              <span className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                {org.property_count} properties
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!isArchived && (
            <div className="text-right text-sm space-y-2">
              <SubscriptionControls 
                organization={{
                  id: org.id,
                  name: org.name,
                  subscription_status: org.subscription_status,
                  subscription_tier: org.subscription_tier,
                  trial_ends_at: org.trial_ends_at,
                  stripe_customer_id: org.stripe_customer_id
                }}
                onUpdate={async () => { await refetchOrgs?.(); }}
              />
              <p className="text-xs text-muted-foreground">
                Created {format(new Date(org.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          )}
          
          {isArchived && org.archive_reason && (
            <div className="text-right text-sm">
              <p className="text-xs text-muted-foreground">Reason: {org.archive_reason}</p>
              <p className="text-xs text-muted-foreground">
                Archived {format(new Date(org.archived_at!), 'MMM d, yyyy')}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {!isArchived && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Active</label>
                  <Switch
                    checked={org.is_active}
                    onCheckedChange={(checked) => toggleOrgStatus({ orgId: org.id, isActive: checked })}
                    disabled={isUpdating}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Template</label>
                  <Switch
                    checked={org.is_template}
                    onCheckedChange={(checked) => toggleTemplateStatus({ orgId: org.id, isTemplate: checked })}
                    disabled={isUpdating}
                  />
                </div>

                {org.is_template && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Type</label>
                    <Select
                      value={org.template_type}
                      onValueChange={(value: TemplateType) => updateTemplateType({ orgId: org.id, templateType: value })}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_property">
                          <span className="flex items-center gap-1">
                            <Home className="h-3 w-3" /> Single
                          </span>
                        </SelectItem>
                        <SelectItem value="multi_property">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" /> Multi
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
            
            <OrganizationActionsMenu
              organizationId={org.id}
              organizationName={org.name}
              memberCount={org.member_count || 0}
              propertyCount={org.property_count || 0}
              isArchived={isArchived}
              onViewDetails={() => setSelectedOrgForDetail(org.id)}
              onArchive={(reason) => archiveOrganization({ orgId: org.id, reason })}
              onRestore={() => restoreOrganization(org.id)}
              onDelete={() => deleteOrganization(org.id)}
              isLoading={isUpdating}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">Manage all tenant organizations</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations ({filteredOrganizations.length})</CardTitle>
          <CardDescription>
            {showArchived ? 'Showing all organizations including archived' : 'Active and inactive organizations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOrgs ? (
            <div className="text-center py-8">Loading organizations...</div>
          ) : (
            <div className="space-y-3">
              {filteredOrganizations.map(org => (
                <OrganizationRow key={org.id} org={org} />
              ))}
              {filteredOrganizations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No organizations match your search' : 'No organizations found'}
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

      {/* Detail View */}
      {selectedOrgForDetail && (
        <TenantDetailView
          organizationId={selectedOrgForDetail}
          open={!!selectedOrgForDetail}
          onOpenChange={(open) => !open && setSelectedOrgForDetail(null)}
        />
      )}
    </div>
  );
};

export default PlatformOrganizationsPage;
