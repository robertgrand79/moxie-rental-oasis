import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Plus, Home, Building, Globe, Users, Eye, Settings, Loader2 } from 'lucide-react';
import { PlatformOrganization, TemplateType } from '@/hooks/usePlatformAdmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { Organization } from '@/types/organizations';

interface TemplateOrganizationsProps {
  organizations: PlatformOrganization[] | undefined;
  loading: boolean;
  onRefresh: () => void;
}

const TemplateOrganizations: React.FC<TemplateOrganizationsProps> = ({ 
  organizations, 
  loading,
  onRefresh 
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    slug: '',
    template_type: 'multi_property' as TemplateType
  });
  
  // Preview modal state
  const [previewOrg, setPreviewOrg] = useState<Organization | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Filter to only show template organizations
  const templateOrgs = organizations?.filter(org => org.is_template) || [];

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.slug) {
      toast.error('Name and slug are required');
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newTemplate.slug)) {
      toast.error('Slug must only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setIsCreating(true);
    try {
      // Check if slug is available
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', newTemplate.slug)
        .single();

      if (existing) {
        toast.error('This slug is already in use');
        setIsCreating(false);
        return;
      }

      // Create the template organization
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: newTemplate.name,
          slug: newTemplate.slug,
          template_type: newTemplate.template_type,
          is_template: true,
          is_active: true
        });

      if (error) throw error;

      toast.success('Template organization created');
      setIsCreateOpen(false);
      setNewTemplate({ name: '', slug: '', template_type: 'multi_property' });
      onRefresh();
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template organization');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePreview = async (org: PlatformOrganization) => {
    setLoadingPreview(true);
    try {
      // Fetch full organization data including API keys
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', org.id)
        .single();

      if (error) throw error;

      setPreviewOrg(data as Organization);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Failed to load organization details:', error);
      toast.error('Failed to load template details');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfigure = (org: Organization) => {
    toast.info(`Configure ${org.name} settings in the organization's admin panel`);
    setPreviewOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Template Organizations
              </CardTitle>
              <CardDescription>
                Organizations that serve as blueprints for new tenants. New signups can clone these templates.
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Template Organization</DialogTitle>
                  <DialogDescription>
                    Create a new organization that will serve as a template for new tenants
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Default Single Property Template"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={newTemplate.slug}
                      onChange={(e) => setNewTemplate({ 
                        ...newTemplate, 
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                      })}
                      placeholder="default-single-template"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used internally for identification. Lowercase letters, numbers, and hyphens only.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Template Type</Label>
                    <Select
                      value={newTemplate.template_type}
                      onValueChange={(value: TemplateType) => setNewTemplate({ ...newTemplate, template_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_property">
                          <span className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Single Property
                          </span>
                        </SelectItem>
                        <SelectItem value="multi_property">
                          <span className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Multi-Property
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Determines the default layout and features for organizations using this template.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {templateOrgs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No template organizations yet</p>
              <p className="text-sm mt-1">Create a template to provide default settings for new tenants</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templateOrgs.map((org) => (
                <div 
                  key={org.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="h-10 w-10 object-contain rounded" />
                      ) : org.template_type === 'single_property' ? (
                        <Home className="h-6 w-6 text-primary" />
                      ) : (
                        <Building className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{org.name}</h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {org.template_type === 'single_property' ? (
                            <>
                              <Home className="h-3 w-3" />
                              Single Property
                            </>
                          ) : (
                            <>
                              <Building className="h-3 w-3" />
                              Multi-Property
                            </>
                          )}
                        </Badge>
                        {!org.is_active && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {org.slug}
                        </span>
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
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreview(org)}
                      disabled={loadingPreview}
                    >
                      {loadingPreview ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreview(org)}
                      disabled={loadingPreview}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TemplatePreviewModal
        organization={previewOrg}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onConfigure={handleConfigure}
      />
    </>
  );
};

export default TemplateOrganizations;
