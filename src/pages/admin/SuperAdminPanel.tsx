import React, { useState } from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { usePlatformAdmin, PlatformOrganization, TemplateType } from '@/hooks/usePlatformAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calendar, 
  TrendingUp, 
  Shield, 
  Search,
  ExternalLink,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Building,
  Settings,
  Layout
} from 'lucide-react';
import PlatformStripeSettings from '@/components/admin/superadmin/PlatformStripeSettings';
import TemplatesManager from '@/components/admin/superadmin/TemplatesManager';
import TemplateOrganizations from '@/components/admin/superadmin/TemplateOrganizations';
import SubscriptionControls from '@/components/admin/superadmin/SubscriptionControls';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SuperAdminPanel = () => {
  const { 
    isPlatformAdmin, 
    checkingAdmin,
    organizations, 
    loadingOrgs, 
    stats, 
    loadingStats,
    toggleOrgStatus,
    toggleTemplateStatus,
    updateTemplateType,
    deleteOrganization,
    isUpdating,
    refetchOrgs
  } = usePlatformAdmin();

  const [searchTerm, setSearchTerm] = useState('');

  if (checkingAdmin) {
    return (
      <AdminPageWrapper title="Super Admin Panel" description="Platform administration">
        <div className="p-8 text-center">Loading...</div>
      </AdminPageWrapper>
    );
  }

  if (!isPlatformAdmin) {
    return (
      <AdminPageWrapper title="Access Denied" description="You don't have permission to access this page">
        <div className="p-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                Platform Admin Access Required
              </CardTitle>
              <CardDescription>
                This page is restricted to platform administrators only.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AdminPageWrapper>
    );
  }

  const filteredOrganizations = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.custom_domain?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const StatCard = ({ title, value, icon: Icon, description }: { 
    title: string; 
    value: number | string; 
    icon: React.ElementType;
    description?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const OrganizationRow = ({ org }: { org: PlatformOrganization }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
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
            {!org.is_active && (
              <Badge variant="destructive">Inactive</Badge>
            )}
            {!org.onboarding_completed && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Onboarding
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {org.slug}
            </span>
            {org.custom_domain && (
              <span className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {org.custom_domain}
              </span>
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
        
        <div className="flex items-center gap-3">
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{org.name}</strong> and remove all its members. 
                  Properties and data may become orphaned. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteOrganization(org.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Organization
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );

  return (
    <AdminPageWrapper 
      title="Super Admin Panel" 
      description="Platform-wide administration and organization management"
    >
      <div className="p-8 space-y-6">
        {/* Platform Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Platform Administrator
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard 
                title="Total Organizations" 
                value={loadingStats ? '...' : stats?.totalOrganizations || 0}
                icon={Building2}
              />
              <StatCard 
                title="Active Organizations" 
                value={loadingStats ? '...' : stats?.activeOrganizations || 0}
                icon={CheckCircle}
              />
              <StatCard 
                title="Total Users" 
                value={loadingStats ? '...' : stats?.totalUsers || 0}
                icon={Users}
              />
              <StatCard 
                title="Total Properties" 
                value={loadingStats ? '...' : stats?.totalProperties || 0}
                icon={Home}
              />
              <StatCard 
                title="Total Reservations" 
                value={loadingStats ? '...' : stats?.totalReservations || 0}
                icon={Calendar}
              />
              <StatCard 
                title="Last 30 Days" 
                value={loadingStats ? '...' : stats?.recentReservations || 0}
                icon={TrendingUp}
                description="New reservations"
              />
            </div>

            {/* Recent Organizations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Organizations</CardTitle>
                <CardDescription>Latest organizations added to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrgs ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    {organizations?.slice(0, 5).map(org => (
                      <OrganizationRow key={org.id} org={org} />
                    ))}
                    {(!organizations || organizations.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No organizations yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="mt-6 space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="outline">
                {filteredOrganizations.length} organization{filteredOrganizations.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Organizations List */}
            <Card>
              <CardHeader>
                <CardTitle>All Organizations</CardTitle>
                <CardDescription>Manage all organizations on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrgs ? (
                  <div className="text-center py-8">Loading organizations...</div>
                ) : filteredOrganizations.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrganizations.map(org => (
                      <OrganizationRow key={org.id} org={org} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No organizations match your search' : 'No organizations found'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6 space-y-6">
            <TemplatesManager />
            <TemplateOrganizations 
              organizations={organizations} 
              loading={loadingOrgs}
              onRefresh={() => refetchOrgs?.()}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <PlatformStripeSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default SuperAdminPanel;
