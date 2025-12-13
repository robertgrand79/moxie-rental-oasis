import React, { useState, useEffect } from 'react';
import { Bot, Save, Loader2, Plus, Trash2, MessageSquare, Sparkles, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import ChatAvatar from '@/components/chat/ChatAvatar';
import { avatarInfo, AvatarType } from '@/components/chat/avatars';
import { cn } from '@/lib/utils';

interface FAQ {
  question: string;
  answer: string;
}

type ChatStyle = 'modern' | 'minimal' | 'playful' | 'elegant';

interface AssistantSettings {
  id?: string;
  organization_id: string;
  is_enabled: boolean;
  display_name: string;
  welcome_message: string;
  bubble_color: string;
  personality: string;
  custom_faqs: FAQ[];
  avatar_type: AvatarType;
  chat_style: ChatStyle;
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

const CHAT_STYLES: { value: ChatStyle; label: string; description: string }[] = [
  { value: 'modern', label: 'Modern', description: 'Gradient backgrounds with smooth shadows' },
  { value: 'minimal', label: 'Minimal', description: 'Clean and understated design' },
  { value: 'playful', label: 'Playful', description: 'Bright and fun with rounded elements' },
  { value: 'elegant', label: 'Elegant', description: 'Refined with subtle details' },
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
        custom_faqs: Array.isArray(data.custom_faqs) ? (data.custom_faqs as unknown as FAQ[]) : [],
        avatar_type: (data.avatar_type as AvatarType) || 'concierge',
        chat_style: (data.chat_style as ChatStyle) || 'modern'
      });
    } else {
      setSettings({
        organization_id: organization.id,
        is_enabled: false,
        display_name: 'AI Assistant',
        welcome_message: 'Hi! I\'m your AI assistant. How can I help you today?',
        bubble_color: '#3B82F6',
        personality: 'friendly',
        custom_faqs: [],
        avatar_type: 'concierge',
        chat_style: 'modern'
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
          custom_faqs: JSON.parse(JSON.stringify(settings.custom_faqs)),
          avatar_type: settings.avatar_type,
          chat_style: settings.chat_style
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
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
                Configure the basic settings of the chat widget.
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          {/* Character Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Character</CardTitle>
              <CardDescription>
                Select a personality avatar for your AI assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {(Object.keys(avatarInfo) as AvatarType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSettings({ ...settings, avatar_type: type })}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-102",
                      "flex flex-col items-center gap-3 text-center",
                      settings.avatar_type === type
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <ChatAvatar type={type} size={64} />
                    <div>
                      <p className="font-medium text-sm">{avatarInfo[type].name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {avatarInfo[type].description}
                      </p>
                    </div>
                    {settings.avatar_type === type && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Style */}
          <Card>
            <CardHeader>
              <CardTitle>Chat Style</CardTitle>
              <CardDescription>
                Choose the visual theme for your chat widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={settings.chat_style}
                onValueChange={(value) => setSettings({ ...settings, chat_style: value as ChatStyle })}
                className="grid grid-cols-2 gap-3"
              >
                {CHAT_STYLES.map((style) => (
                  <Label
                    key={style.value}
                    htmlFor={style.value}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      settings.chat_style === style.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={style.value} id={style.value} className="mt-0.5" />
                    <div>
                      <span className="font-medium">{style.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {style.description}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Bubble Color */}
          <Card>
            <CardHeader>
              <CardTitle>Accent Color</CardTitle>
              <CardDescription>
                Choose the primary color for your chat widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSettings({ ...settings, bubble_color: color })}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-all",
                      settings.bubble_color === color
                        ? "border-foreground scale-110 shadow-lg"
                        : "border-transparent hover:scale-105"
                    )}
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
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your chat widget will appear to visitors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-72 rounded-xl border bg-gradient-to-br from-muted/30 to-muted/60 flex items-end justify-end p-4 overflow-hidden">
                {/* Mini chat preview */}
                <div className={cn(
                  "w-72 rounded-xl shadow-2xl overflow-hidden border",
                  settings.chat_style === 'modern' && "bg-background",
                  settings.chat_style === 'minimal' && "bg-background border-2",
                  settings.chat_style === 'playful' && "bg-background rounded-3xl",
                  settings.chat_style === 'elegant' && "bg-background border-0 shadow-xl"
                )}>
                  {/* Header */}
                  <div 
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 text-white",
                      settings.chat_style === 'playful' && "rounded-t-2xl"
                    )}
                    style={{ backgroundColor: settings.bubble_color }}
                  >
                    <ChatAvatar type={settings.avatar_type} size={28} />
                    <span className="font-medium text-sm">{settings.display_name}</span>
                  </div>
                  {/* Messages */}
                  <div className="p-3 space-y-2 bg-background">
                    {/* Welcome */}
                    <div className="flex gap-2">
                      <ChatAvatar type={settings.avatar_type} size={24} />
                      <div className={cn(
                        "rounded-2xl rounded-bl-sm px-3 py-1.5 text-xs max-w-[85%]",
                        settings.chat_style === 'elegant' ? "bg-muted/50" : "bg-muted"
                      )}>
                        {settings.welcome_message.substring(0, 60)}...
                      </div>
                    </div>
                    {/* User message */}
                    <div className="flex justify-end">
                      <div 
                        className={cn(
                          "rounded-2xl rounded-br-sm px-3 py-1.5 text-xs text-white max-w-[85%]",
                          settings.chat_style === 'playful' && "rounded-3xl"
                        )}
                        style={{ backgroundColor: settings.bubble_color }}
                      >
                        How do I check in?
                      </div>
                    </div>
                  </div>
                  
                  {/* Input area preview */}
                  <div className="px-3 py-2 border-t bg-muted/30">
                    <div className="flex gap-2 items-center">
                      <div className={cn(
                        "flex-1 px-3 py-1.5 text-xs text-muted-foreground bg-background border",
                        settings.chat_style === 'playful' ? 'rounded-2xl' : 'rounded-lg'
                      )}>
                        Type a message...
                      </div>
                      <div 
                        className={cn(
                          "h-7 w-7 flex items-center justify-center rounded-full",
                          settings.chat_style === 'playful' ? 'rounded-xl' : 'rounded-lg'
                        )}
                        style={{ backgroundColor: settings.bubble_color }}
                      >
                        <ChatAvatar type={settings.avatar_type} size={18} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating bubble preview */}
                <div 
                  className={cn(
                    "absolute bottom-4 right-4 h-12 w-12 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105",
                    settings.chat_style === 'playful' && "h-14 w-14"
                  )}
                  style={{ backgroundColor: settings.bubble_color }}
                >
                  <ChatAvatar type={settings.avatar_type} size={settings.chat_style === 'playful' ? 36 : 32} />
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
