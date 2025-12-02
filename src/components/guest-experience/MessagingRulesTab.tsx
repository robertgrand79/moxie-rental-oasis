import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Globe, Home, Mail, MessageSquare, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RuleDialog from './RuleDialog';
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

interface MessagingRule {
  id: string;
  property_id: string | null;
  template_id: string;
  name: string;
  trigger_type: string;
  trigger_offset_hours: number;
  trigger_time: string;
  delivery_channel: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  properties?: { title: string } | null;
  message_templates?: { name: string; subject: string } | null;
}

const TRIGGER_LABELS: Record<string, string> = {
  booking_confirmed: 'On booking confirmation',
  before_checkin: 'Before check-in',
  day_of_checkin: 'Day of check-in',
  after_checkin: 'After check-in',
  before_checkout: 'Before check-out',
  after_checkout: 'After check-out',
};

const formatTriggerDisplay = (rule: MessagingRule) => {
  const triggerLabel = TRIGGER_LABELS[rule.trigger_type] || rule.trigger_type;
  
  if (rule.trigger_type === 'booking_confirmed' || rule.trigger_type === 'day_of_checkin') {
    return triggerLabel;
  }
  
  const hours = Math.abs(rule.trigger_offset_hours);
  const unit = hours === 1 ? 'hour' : hours < 24 ? 'hours' : hours === 24 ? 'day' : 'days';
  const value = hours < 24 ? hours : Math.floor(hours / 24);
  
  if (rule.trigger_type.startsWith('before_')) {
    return `${value} ${unit} before ${rule.trigger_type.replace('before_', '')}`;
  } else if (rule.trigger_type.startsWith('after_')) {
    return `${value} ${unit} after ${rule.trigger_type.replace('after_', '')}`;
  }
  
  return triggerLabel;
};

const MessagingRulesTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<MessagingRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['messaging-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messaging_rules')
        .select('*, properties(title), message_templates(name, subject)')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as MessagingRule[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('messaging_rules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-rules'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating rule', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('messaging_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-rules'] });
      toast({ title: 'Rule deleted successfully' });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting rule', description: error.message, variant: 'destructive' });
    },
  });

  const globalRules = rules?.filter(r => !r.property_id) || [];
  const propertyRules = rules?.filter(r => r.property_id) || [];

  // Group property rules by property
  const groupedPropertyRules = propertyRules.reduce((acc, rule) => {
    const propertyName = rule.properties?.title || 'Unknown Property';
    if (!acc[propertyName]) acc[propertyName] = [];
    acc[propertyName].push(rule);
    return acc;
  }, {} as Record<string, MessagingRule[]>);

  const handleEdit = (rule: MessagingRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const renderRuleRow = (rule: MessagingRule) => {
    const channelIcon = rule.delivery_channel === 'sms' ? (
      <MessageSquare className="h-4 w-4" />
    ) : (
      <Mail className="h-4 w-4" />
    );

    return (
      <div
        key={rule.id}
        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <Switch
            checked={rule.is_active}
            onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, is_active: checked })}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{rule.name}</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {channelIcon}
                {rule.delivery_channel}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTriggerDisplay(rule)}</span>
              {rule.trigger_time && (
                <span className="text-xs">at {rule.trigger_time.slice(0, 5)}</span>
              )}
            </div>
            {rule.message_templates && (
              <p className="text-xs text-muted-foreground mt-1">
                Template: {rule.message_templates.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(rule.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
          <h3 className="text-lg font-semibold">Messaging Rules</h3>
          <p className="text-sm text-muted-foreground">
            Set up automated messages triggered by booking events
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Global Rules */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Global Rules</CardTitle>
            <Badge variant="secondary">{globalRules.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            These rules apply to all properties
          </p>
        </CardHeader>
        <CardContent>
          {globalRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No global rules configured</p>
              <p className="text-sm">Create rules that apply to all properties</p>
            </div>
          ) : (
            <div className="space-y-2">
              {globalRules.map(renderRuleRow)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property-Specific Rules */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Property-Specific Rules</CardTitle>
            <Badge variant="secondary">{propertyRules.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Rules that only apply to specific properties
          </p>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedPropertyRules).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No property-specific rules configured</p>
              <p className="text-sm">Create rules for individual properties</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPropertyRules).map(([propertyName, rules]) => (
                <div key={propertyName}>
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {propertyName}
                  </h5>
                  <div className="space-y-2 pl-6">
                    {rules.map(renderRuleRow)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this messaging rule? This action cannot be undone.
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

export default MessagingRulesTab;
