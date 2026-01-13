import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Copy, Loader2 } from 'lucide-react';
import { usePlatformEmailTemplates, type CreateTemplateInput } from '@/hooks/usePlatformEmailTemplates';
import { toast } from 'sonner';

const CATEGORIES = ['support', 'billing', 'onboarding', 'notification', 'other'];

const EmailTemplateManager = () => {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = usePlatformEmailTemplates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<CreateTemplateInput>({
    name: '',
    subject: '',
    body_html: '',
    category: 'support',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body_html: '',
      category: 'support',
    });
    setEditingTemplate(null);
  };

  const handleOpenDialog = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        body_html: template.body_html,
        category: template.category,
        variables: template.variables,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('Template name is required');
      return;
    }
    if (!formData.subject) {
      toast.error('Subject is required');
      return;
    }

    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id, ...formData },
        {
          onSuccess: () => {
            toast.success('Template updated');
            handleCloseDialog();
          },
        }
      );
    } else {
      createTemplate.mutate(formData, {
        onSuccess: () => {
          toast.success('Template created');
          handleCloseDialog();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate.mutate(id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateTemplate.mutate(id, {
      onSuccess: () => {
        toast.success('Template duplicated');
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Create reusable email templates for quick responses
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
              <DialogDescription>
                Create a reusable email template. Use {'{'}variable{'}'} syntax for dynamic content.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Welcome Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Welcome to our platform, {name}!"
                />
              </div>
              <div className="space-y-2">
                <Label>Body (HTML)</Label>
                <Textarea
                  value={formData.body_html}
                  onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                  placeholder="<p>Hello {name},</p><p>Welcome to our platform!</p>"
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Variables (comma-separated)</Label>
                <Input
                  value={formData.variables?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean),
                  })}
                  placeholder="name, email, company"
                />
                <p className="text-xs text-muted-foreground">
                  Define variables used in your template for easy reference
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createTemplate.isPending || updateTemplate.isPending}
              >
                {(createTemplate.isPending || updateTemplate.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {templates && templates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map(template => (
              <Card key={template.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                    {!template.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Subject:</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {template.subject}
                    </p>
                  </div>
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((v: string) => (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {'{' + v + '}'}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(template.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No templates yet. Create one to speed up your email responses.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailTemplateManager;
