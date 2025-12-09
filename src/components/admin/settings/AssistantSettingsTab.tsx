import React, { useState, useEffect } from 'react';
import { Bot, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';

interface AssistantSettings {
  id?: string;
  organization_id: string;
  is_enabled: boolean;
  display_name: string;
  welcome_message: string;
  bubble_color: string;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

const AssistantSettingsTab = () => {
  const { organization } = useCurrentOrganization();
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organization?.id) {
      fetchSettings();
    }
  }, [organization?.id]);

  const fetchSettings = async () => {
    if (!organization?.id) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('assistant_settings')
      .select('*')
      .eq('organization_id', organization.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
    }

    if (data) {
      setSettings(data);
    } else {
      // Set defaults
      setSettings({
        organization_id: organization.id,
        is_enabled: false,
        display_name: 'Stay Moxie Assistant',
        welcome_message: 'Hi! I\'m your AI assistant. How can I help you today?',
        bubble_color: '#3B82F6'
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!settings || !organization?.id) return;

    setIsSaving(true);
    try {
      const payload = {
        organization_id: organization.id,
        is_enabled: settings.is_enabled,
        display_name: settings.display_name,
        welcome_message: settings.welcome_message,
        bubble_color: settings.bubble_color
      };

      const { error } = await supabase
        .from('assistant_settings')
        .upsert(payload, { onConflict: 'organization_id' });

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'AI Assistant settings have been updated.'
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>AI Assistant Widget</CardTitle>
          </div>
          <CardDescription>
            Configure the public AI chat widget that appears on your website for visitors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Enable AI Assistant</Label>
              <p className="text-sm text-muted-foreground">
                Show the chat widget on your public website
              </p>
            </div>
            <Switch
              checked={settings.is_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, is_enabled: checked })
              }
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={settings.display_name}
              onChange={(e) =>
                setSettings({ ...settings, display_name: e.target.value })
              }
              placeholder="Stay Moxie Assistant"
            />
            <p className="text-xs text-muted-foreground">
              The name shown in the chat header
            </p>
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <Label htmlFor="welcome_message">Welcome Message</Label>
            <Textarea
              id="welcome_message"
              value={settings.welcome_message}
              onChange={(e) =>
                setSettings({ ...settings, welcome_message: e.target.value })
              }
              placeholder="Hi! I'm your AI assistant. How can I help you today?"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Displayed when visitors first open the chat
            </p>
          </div>

          {/* Bubble Color */}
          <div className="space-y-3">
            <Label>Bubble Color</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSettings({ ...settings, bubble_color: color })}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    settings.bubble_color === color
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="custom_color" className="text-sm">Custom:</Label>
              <Input
                id="custom_color"
                type="color"
                value={settings.bubble_color}
                onChange={(e) =>
                  setSettings({ ...settings, bubble_color: e.target.value })
                }
                className="h-10 w-16 p-1 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">
                {settings.bubble_color}
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="relative h-32 rounded-lg border bg-muted/50 flex items-end justify-end p-4">
              <div
                className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white"
                style={{ backgroundColor: settings.bubble_color }}
              >
                <Bot className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantSettingsTab;
