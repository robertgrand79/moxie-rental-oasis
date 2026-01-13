import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Workflow,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Building,
  TicketIcon,
  Hand,
  ArrowRight,
  Clock,
  Code,
  User,
  Users,
} from 'lucide-react';
import {
  usePlatformTaskTemplates,
  TaskTemplate,
  CreateTemplateInput,
  TRIGGER_EVENTS,
  TEMPLATE_VARIABLES,
} from '@/hooks/usePlatformTaskTemplates';
import { PlatformAdminSelect } from '@/components/admin/platform/PlatformAdminSelect';
import { cn } from '@/lib/utils';

const getTriggerIcon = (trigger: string) => {
  switch (trigger) {
    case 'user_registration':
      return <UserPlus className="h-4 w-4" />;
    case 'organization_created':
      return <Building className="h-4 w-4" />;
    case 'support_ticket':
      return <TicketIcon className="h-4 w-4" />;
    case 'manual':
      return <Hand className="h-4 w-4" />;
    default:
      return <Workflow className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'normal':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'low':
      return 'bg-muted text-muted-foreground border-muted-foreground/20';
    default:
      return '';
  }
};

interface TemplateFormData {
  name: string;
  description: string;
  trigger_event: TaskTemplate['trigger_event'];
  title_template: string;
  description_template: string;
  priority: 'low' | 'normal' | 'high';
  due_days: string;
  assign_to_user_id: string | null;
  assign_to_role: string | null;
}

const initialFormData: TemplateFormData = {
  name: '',
  description: '',
  trigger_event: 'user_registration',
  title_template: '',
  description_template: '',
  priority: 'normal',
  due_days: '',
  assign_to_user_id: null,
  assign_to_role: null,
};

const TaskWorkflowManager: React.FC = () => {
  const {
    templates,
    templatesByTrigger,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplate,
    isCreating,
    isUpdating,
  } = usePlatformTaskTemplates({ includeInactive: true });

  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData(initialFormData);
    setShowDialog(true);
  };

  const handleOpenEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      trigger_event: template.trigger_event,
      title_template: template.title_template,
      description_template: template.description_template || '',
      priority: template.priority,
      due_days: template.due_days?.toString() || '',
      assign_to_user_id: template.assign_to_user_id || null,
      assign_to_role: template.assign_to_role || null,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      trigger_event: formData.trigger_event,
      title_template: formData.title_template,
      description_template: formData.description_template || undefined,
      priority: formData.priority,
      due_days: formData.due_days ? parseInt(formData.due_days) : undefined,
      assign_to_user_id: formData.assign_to_user_id,
      assign_to_role: formData.assign_to_role,
    };

    if (editingTemplate) {
      updateTemplate({ id: editingTemplate.id, ...payload });
    } else {
      createTemplate(payload as CreateTemplateInput);
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setDeleteConfirmId(null);
  };

  const availableVariables = TEMPLATE_VARIABLES[formData.trigger_event] || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Task Workflow Templates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automate task creation based on platform events
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates by Trigger */}
      {TRIGGER_EVENTS.map((trigger) => {
        const triggerTemplates = templatesByTrigger[trigger.value] || [];
        
        return (
          <Card key={trigger.value}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getTriggerIcon(trigger.value)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{trigger.label}</CardTitle>
                    <CardDescription className="text-xs">{trigger.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">
                  {triggerTemplates.filter(t => t.is_active).length} active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {triggerTemplates.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No templates configured for this trigger</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFormData({ ...initialFormData, trigger_event: trigger.value as TaskTemplate['trigger_event'] });
                      setEditingTemplate(null);
                      setShowDialog(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {triggerTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-colors',
                        template.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{template.name}</p>
                          <Badge variant="outline" className={cn('text-xs', getPriorityColor(template.priority))}>
                            {template.priority}
                          </Badge>
                          {template.due_days && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.due_days}d
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          <ArrowRight className="h-3 w-3 inline mr-1" />
                          {template.title_template}
                        </p>
                        {(template.assigned_user || template.assign_to_role) && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {template.assigned_user ? (
                              <>
                                <User className="h-3 w-3" />
                                {template.assigned_user.full_name || template.assigned_user.email}
                              </>
                            ) : (
                              <>
                                <Users className="h-3 w-3" />
                                By Role: {template.assign_to_role === 'super_admin' ? 'Super Admin' : 'Platform Admin'}
                              </>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) => toggleTemplate({ id: template.id, is_active: checked })}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(template)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirmId(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Task Template'}</DialogTitle>
            <DialogDescription>
              Configure a template that will automatically create tasks when triggered
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., Welcome New User"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <Select
                value={formData.trigger_event}
                onValueChange={(value) => setFormData({ ...formData, trigger_event: value as TaskTemplate['trigger_event'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      <div className="flex items-center gap-2">
                        {getTriggerIcon(trigger.value)}
                        {trigger.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Task Title Template</Label>
              <Input
                placeholder="e.g., Welcome call with {{user_name}}"
                value={formData.title_template}
                onChange={(e) => setFormData({ ...formData, title_template: e.target.value })}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {availableVariables.map((variable) => (
                  <Badge
                    key={variable}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-accent"
                    onClick={() => setFormData({ ...formData, title_template: formData.title_template + ' ' + variable })}
                  >
                    <Code className="h-3 w-3 mr-1" />
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Task Description (Optional)</Label>
              <Textarea
                placeholder="Describe what needs to be done..."
                value={formData.description_template}
                onChange={(e) => setFormData({ ...formData, description_template: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'normal' | 'high' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Days After Trigger</Label>
                <Input
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.due_days}
                  onChange={(e) => setFormData({ ...formData, due_days: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Auto-Assign To</Label>
              <PlatformAdminSelect
                value={formData.assign_to_user_id}
                onChange={(userId) => setFormData({ ...formData, assign_to_user_id: userId })}
                roleValue={formData.assign_to_role}
                onRoleChange={(role) => setFormData({ ...formData, assign_to_role: role })}
                showRoleOption={true}
                placeholder="Unassigned (manual assignment)"
              />
              <p className="text-xs text-muted-foreground">
                Tasks will be automatically assigned when created from this template
              </p>
            </div>

            <div className="space-y-2">
              <Label>Description (Internal)</Label>
              <Input
                placeholder="Notes about this template..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.title_template || isCreating || isUpdating}
            >
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task template. Tasks already created from this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskWorkflowManager;
