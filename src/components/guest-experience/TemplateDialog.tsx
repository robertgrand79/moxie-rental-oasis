import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, Wand2, Eye, FileEdit } from 'lucide-react';
import TemplatePreview from './TemplatePreview';

interface MessageTemplate {
  id: string;
  property_id: string | null;
  name: string;
  category: string;
  subject: string;
  content: string;
  is_default: boolean;
  is_active: boolean;
}

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: MessageTemplate | null;
}

interface FormData {
  name: string;
  property_id: string;
  category: string;
  subject: string;
  content: string;
  is_default: boolean;
  is_active: boolean;
}

const TEMPLATE_VARIABLES = [
  { key: '{{guest_name}}', description: 'Guest name' },
  { key: '{{property_name}}', description: 'Property name' },
  { key: '{{property_address}}', description: 'Property address' },
  { key: '{{check_in_date}}', description: 'Check-in date' },
  { key: '{{check_out_date}}', description: 'Check-out date' },
  { key: '{{check_in_time}}', description: 'Check-in time' },
  { key: '{{check_out_time}}', description: 'Check-out time' },
  { key: '{{wifi_network}}', description: 'WiFi network' },
  { key: '{{wifi_password}}', description: 'WiFi password' },
  { key: '{{door_code}}', description: 'Door access code' },
  { key: '{{nights_count}}', description: 'Number of nights' },
  { key: '{{guest_count}}', description: 'Number of guests' },
  { key: '{{guidebook_link}}', description: 'Digital guidebook link' },
];

const TemplateDialog: React.FC<TemplateDialogProps> = ({ open, onOpenChange, template }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organization } = useCurrentOrganization();
  const isEditing = !!template;
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('edit');
  
  // Use organization-scoped properties
  const { properties } = usePropertyFetch();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      property_id: 'global',
      category: 'custom',
      subject: '',
      content: '',
      is_default: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        property_id: template.property_id || 'global',
        category: template.category,
        subject: template.subject,
        content: template.content,
        is_default: template.is_default,
        is_active: template.is_active,
      });
    } else {
      reset({
        name: '',
        property_id: 'global',
        category: 'custom',
        subject: '',
        content: '',
        is_default: false,
        is_active: true,
      });
    }
  }, [template, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        name: data.name,
        property_id: data.property_id === 'global' ? null : data.property_id,
        category: data.category,
        subject: data.subject,
        content: data.content,
        is_default: data.is_default,
        is_active: data.is_active,
      };

      if (isEditing && template) {
        const { error } = await supabase
          .from('message_templates')
          .update(payload)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('message_templates').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({ title: isEditing ? 'Template updated' : 'Template created' });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error saving template', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = watch('content');
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
      setValue('content', newValue);
    }
  };

  const handleAIGenerate = async (action: 'generate' | 'improve') => {
    if (!organization?.id) {
      toast({ title: 'Organization not found', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-message-template', {
        body: {
          organizationId: organization.id,
          templateType: watch('category') as any,
          description: watch('name'),
          existingContent: action === 'improve' ? watch('content') : undefined,
          action,
          propertyId: watch('property_id') !== 'global' ? watch('property_id') : undefined,
        }
      });

      if (error) throw error;

      if (data?.subject) {
        setValue('subject', data.subject);
      }
      if (data?.content) {
        setValue('content', data.content);
      }

      toast({ 
        title: action === 'generate' ? 'Template generated!' : 'Template improved!',
        description: 'Review and customize as needed.'
      });
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({ 
        title: 'AI generation failed', 
        description: error.message || 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Check-in Instructions"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_id">Apply To</Label>
              <Select
                value={watch('property_id')}
                onValueChange={(value) => setValue('property_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">All Properties (Global)</SelectItem>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="checkin">Check-in</SelectItem>
                  <SelectItem value="checkin_reminder">Check-in Reminder</SelectItem>
                  <SelectItem value="checkin_instructions">Check-in Instructions</SelectItem>
                  <SelectItem value="checkout">Check-out</SelectItem>
                  <SelectItem value="checkout_reminder">Check-out Reminder</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="review_request">Review Request</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_default"
                  checked={watch('is_default')}
                  onCheckedChange={(checked) => setValue('is_default', checked)}
                />
                <Label htmlFor="is_default">Default</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              {...register('subject', { required: 'Subject is required' })}
              placeholder="Your check-in instructions for {{property_name}}"
            />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                Edit Content
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template-content">Message Content</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIGenerate('generate')}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                      AI Generate
                    </Button>
                    {watch('content') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIGenerate('improve')}
                        disabled={isGenerating}
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        Improve
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="template-content"
                  {...register('content', { required: 'Content is required' })}
                  placeholder="Hi {{guest_name}},&#10;&#10;Welcome to {{property_name}}! Here are your check-in instructions..."
                  className="min-h-[250px] font-mono text-sm"
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <Badge
                      key={v.key}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => insertVariable(v.key)}
                      title={v.description}
                    >
                      {v.key}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <TemplatePreview
                subject={watch('subject')}
                content={watch('content')}
                companyName={organization?.name}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
