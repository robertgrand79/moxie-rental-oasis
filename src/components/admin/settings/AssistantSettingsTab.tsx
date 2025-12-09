import React, { useState, useEffect } from 'react';
import { Bot, Save, Loader2, Plus, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';

interface FAQ {
  question: string;
  answer: string;
}

interface AssistantSettings {
  id?: string;
  organization_id: string;
  is_enabled: boolean;
  display_name: string;
  welcome_message: string;
  bubble_color: string;
  personality: string;
  custom_faqs: FAQ[];
}

const DEFAULT_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#6366F1',
];

const PERSONALITIES = [
  { value: 'friendly', label: 'Friendly', description: 'Warm, conversational, and approachable' },
  { value: 'professional', label: 'Professional', description: 'Polished, efficient, and courteous' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, informal, and personable' },
  { value: 'concise', label: 'Concise', description: 'Brief, to the point, and efficient' },
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
      setSettings({
        ...data,
        custom_faqs: Array.isArray(data.custom_faqs) ? (data.custom_faqs as unknown as FAQ[]) : []
      });
    } else {
      setSettings({
        organization_id: organization.id,
        is_enabled: false,
        display_name: 'AI Assistant',
        welcome_message: 'Hi! I\'m your AI assistant. How can I help you today?',
        bubble_color: '#3B82F6',
        personality: 'friendly',
        custom_faqs: []
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!settings || !organization?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('assistant_settings')
        .upsert([{
          organization_id: organization.id,
          is_enabled: settings.is_enabled,
          display_name: settings.display_name,
          welcome_message: settings.welcome_message,
          bubble_color: settings.bubble_color,
          personality: settings.personality,
          custom_faqs: JSON.parse(JSON.stringify(settings.custom_faqs))
        }], { onConflict: 'organization_id' });

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

  const addFAQ = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      custom_faqs: [...settings.custom_faqs, { question: '', answer: '' }]
    });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    if (!settings) return;
    const updated = [...settings.custom_faqs];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, custom_faqs: updated });
  };

  const removeFAQ = (index: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      custom_faqs: settings.custom_faqs.filter((_, i) => i !== index)
    });
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
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="personality" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Personality</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">FAQs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Settings</CardTitle>
              <CardDescription>
                Configure the appearance and behavior of the chat widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Toggle */}
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
                  placeholder="AI Assistant"
                />
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
                  placeholder="Hi! How can I help you today?"
                  rows={3}
                />
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
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Custom:</Label>
                  <Input
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Personality</CardTitle>
              <CardDescription>
                Choose how the AI assistant communicates with visitors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Personality Style</Label>
                <Select
                  value={settings.personality}
                  onValueChange={(value) =>
                    setSettings({ ...settings, personality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a personality" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSONALITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex flex-col">
                          <span>{p.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {p.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Preview</h4>
                <p className="text-sm text-muted-foreground">
                  {settings.personality === 'friendly' &&
                    '"Hey there! 👋 I\'d love to help you find the perfect stay. What dates are you thinking about?"'}
                  {settings.personality === 'professional' &&
                    '"Good day. I\'m here to assist with your booking inquiries. Please let me know how I can help."'}
                  {settings.personality === 'casual' &&
                    '"What\'s up! Looking for a place to crash? I can help you out with that."'}
                  {settings.personality === 'concise' &&
                    '"Hello. Ready to assist. What do you need?"'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom FAQs</CardTitle>
                  <CardDescription>
                    Add frequently asked questions for the AI to reference.
                  </CardDescription>
                </div>
                <Button onClick={addFAQ} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.custom_faqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No custom FAQs added yet.</p>
                  <p className="text-sm">Add FAQs to help the AI answer common questions.</p>
                </div>
              ) : (
                settings.custom_faqs.map((faq, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Question</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                            placeholder="e.g., What is your cancellation policy?"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Answer</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                            placeholder="e.g., We offer free cancellation up to 48 hours before check-in."
                            rows={2}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFAQ(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
};

export default AssistantSettingsTab;
