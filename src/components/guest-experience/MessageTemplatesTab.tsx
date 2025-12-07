import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Globe, Home, Mail, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TemplateDialog from './TemplateDialog';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
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

interface MessageTemplate {
  id: string;
  property_id: string | null;
  name: string;
  category: string;
  subject: string;
  content: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  properties?: { title: string } | null;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  welcome: { label: 'Welcome', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  checkin: { label: 'Check-in', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  checkout: { label: 'Check-out', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  followup: { label: 'Follow-up', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  custom: { label: 'Custom', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
};

const MessageTemplatesTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get organization-scoped property IDs
  const { properties: orgProperties, loading: propertiesLoading } = usePropertyFetch();
  const orgPropertyIds = orgProperties.map(p => p.id);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['message-templates', orgPropertyIds],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*, properties(title)')
        .or(`property_id.is.null,property_id.in.(${orgPropertyIds.join(',')})`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MessageTemplate[];
    },
    enabled: !propertiesLoading && orgPropertyIds.length > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('message_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({ title: 'Template deleted successfully' });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting template', description: error.message, variant: 'destructive' });
    },
  });

  const globalTemplates = templates?.filter(t => !t.property_id) || [];
  const propertyTemplates = templates?.filter(t => t.property_id) || [];

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const renderTemplateCard = (template: MessageTemplate) => {
    const category = CATEGORY_LABELS[template.category] || CATEGORY_LABELS.custom;
    
    return (
      <Card key={template.id} className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.is_default && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
                {!template.is_active && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                )}
              </div>
              <Badge variant="outline" className={category.color}>
                {category.label}
              </Badge>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteId(template.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{template.subject}</span>
            </div>
            <p className="text-muted-foreground line-clamp-2">{template.content}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Message Templates</h3>
          <p className="text-sm text-muted-foreground">
            Create reusable templates for automated guest communications
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Global Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-medium">Global Templates</h4>
          <Badge variant="secondary">{globalTemplates.length}</Badge>
        </div>
        {globalTemplates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No global templates yet</p>
              <p className="text-sm text-muted-foreground">
                Create templates that can be used across all properties
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {globalTemplates.map(renderTemplateCard)}
          </div>
        )}
      </div>

      {/* Property-Specific Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-medium">Property-Specific Templates</h4>
          <Badge variant="secondary">{propertyTemplates.length}</Badge>
        </div>
        {propertyTemplates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Home className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No property-specific templates yet</p>
              <p className="text-sm text-muted-foreground">
                Create templates for individual properties with custom messaging
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {propertyTemplates.map(renderTemplateCard)}
          </div>
        )}
      </div>

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
              Any rules using this template will also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MessageTemplatesTab;
