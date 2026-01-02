import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Layout, Plus, Edit, DollarSign, Building, Home, Loader2, RefreshCw, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { usePlatformSettings, SiteTemplate } from '@/hooks/usePlatformSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TemplatesManager = () => {
  const { templates, loadingTemplates, updateTemplate, createTemplate, deleteTemplate, isUpdating } = usePlatformSettings();
  const [editingTemplate, setEditingTemplate] = useState<SiteTemplate | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<SiteTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    slug: '',
    description: '',
    monthly_price_cents: 0,
    annual_price_cents: 0,
    max_properties: null as number | null,
    features: [] as string[],
    is_active: true,
    display_order: 0
  });

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    await updateTemplate.mutateAsync({
      id: editingTemplate.id,
      updates: {
        name: editingTemplate.name,
        description: editingTemplate.description,
        monthly_price_cents: editingTemplate.monthly_price_cents,
        annual_price_cents: editingTemplate.annual_price_cents,
        max_properties: editingTemplate.max_properties,
        is_active: editingTemplate.is_active,
        stripe_product_id: editingTemplate.stripe_product_id,
        stripe_price_id: editingTemplate.stripe_price_id,
        stripe_annual_price_id: editingTemplate.stripe_annual_price_id
      }
    });
    setEditingTemplate(null);
  };

  const handleCreateTemplate = async () => {
    await createTemplate.mutateAsync({
      ...newTemplate,
      stripe_product_id: null,
      stripe_price_id: null,
      stripe_annual_price_id: null
    });
    setIsCreateOpen(false);
    setNewTemplate({
      name: '',
      slug: '',
      description: '',
      monthly_price_cents: 0,
      annual_price_cents: 0,
      max_properties: null,
      features: [],
      is_active: true,
      display_order: 0
    });
  };

  const handleSyncStripeProducts = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-stripe-products');
      
      if (error) throw error;
      
      if (data.success) {
        toast.success('Stripe products synced successfully');
        // Refresh templates to show updated Stripe IDs
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to sync Stripe products');
      }
    } catch (error) {
      console.error('Failed to sync Stripe products:', error);
      toast.error('Failed to sync Stripe products');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loadingTemplates) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Site Templates
              </CardTitle>
              <CardDescription>
                Manage subscription tiers and pricing for new tenants
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleSyncStripeProducts}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync with Stripe
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Add a new subscription tier for tenants
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Enterprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={newTemplate.slug}
                      onChange={(e) => setNewTemplate({ ...newTemplate, slug: e.target.value })}
                      placeholder="enterprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      placeholder="For large property management companies"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={(newTemplate.monthly_price_cents / 100).toFixed(2)}
                        onChange={(e) => setNewTemplate({ 
                          ...newTemplate, 
                          monthly_price_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Annual Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newTemplate.annual_price_cents ? (newTemplate.annual_price_cents / 100).toFixed(2) : ''}
                        onChange={(e) => setNewTemplate({ 
                          ...newTemplate, 
                          annual_price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : 0
                        })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Properties</Label>
                    <Input
                      type="number"
                      value={newTemplate.max_properties || ''}
                      onChange={(e) => setNewTemplate({ 
                        ...newTemplate, 
                        max_properties: e.target.value ? parseInt(e.target.value) : null
                      })}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate} disabled={isUpdating}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates?.map((template) => (
              <div 
                key={template.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {template.max_properties === 1 ? (
                      <Home className="h-6 w-6 text-primary" />
                    ) : (
                      <Building className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      {!template.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(template.monthly_price_cents)}/mo
                      </span>
                      {template.annual_price_cents && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          {formatPrice(template.annual_price_cents)}/yr
                        </span>
                      )}
                      <span>
                        {template.max_properties ? `${template.max_properties} property` : 'Unlimited properties'}
                      </span>
                      {template.stripe_product_id ? (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Stripe Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Synced
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={editingTemplate?.id === template.id} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Template</DialogTitle>
                      <DialogDescription>
                        Update template settings and pricing
                      </DialogDescription>
                    </DialogHeader>
                    {editingTemplate && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={editingTemplate.name}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={editingTemplate.description || ''}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Monthly Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={(editingTemplate.monthly_price_cents / 100).toFixed(2)}
                              onChange={(e) => setEditingTemplate({ 
                                ...editingTemplate, 
                                monthly_price_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Annual Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingTemplate.annual_price_cents ? (editingTemplate.annual_price_cents / 100).toFixed(2) : ''}
                              onChange={(e) => setEditingTemplate({ 
                                ...editingTemplate, 
                                annual_price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null
                              })}
                              placeholder="Leave empty if no annual option"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Max Properties</Label>
                          <Input
                            type="number"
                            value={editingTemplate.max_properties || ''}
                            onChange={(e) => setEditingTemplate({ 
                              ...editingTemplate, 
                              max_properties: e.target.value ? parseInt(e.target.value) : null
                            })}
                            placeholder="Unlimited"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Stripe Product ID</Label>
                          <Input
                            value={editingTemplate.stripe_product_id || ''}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, stripe_product_id: e.target.value || null })}
                            placeholder="prod_..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Monthly Price ID</Label>
                            <Input
                              value={editingTemplate.stripe_price_id || ''}
                              onChange={(e) => setEditingTemplate({ ...editingTemplate, stripe_price_id: e.target.value || null })}
                              placeholder="price_..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Annual Price ID</Label>
                            <Input
                              value={editingTemplate.stripe_annual_price_id || ''}
                              onChange={(e) => setEditingTemplate({ ...editingTemplate, stripe_annual_price_id: e.target.value || null })}
                              placeholder="price_..."
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editingTemplate.is_active}
                            onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, is_active: checked })}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateTemplate} disabled={isUpdating}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingTemplate(template)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingTemplate} onOpenChange={(open) => !open && setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deletingTemplate) {
                  deleteTemplate.mutate(deletingTemplate.id);
                  setDeletingTemplate(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplatesManager;
