import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Send, Lightbulb, Bug, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePlatformInbox } from '@/hooks/usePlatformInbox';

const feedbackSchema = z.object({
  category: z.enum(['feature_request', 'bug_report', 'general', 'improvement']),
  subject: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more details (at least 20 characters)'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();
  const { createItemAsync, isCreating } = usePlatformInbox();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: 'feature_request',
      subject: '',
      description: '',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      await createItemAsync({
        type: 'feedback',
        category: data.category,
        subject: data.subject,
        description: data.description,
        user_id: user?.id,
        organization_id: organization?.id,
        email: user?.email,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const feedbackTypes = [
    { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, description: 'Suggest a new feature' },
    { value: 'improvement', label: 'Improvement', icon: Sparkles, description: 'Improve existing feature' },
    { value: 'bug_report', label: 'Bug Report', icon: Bug, description: 'Report a problem' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, description: 'Share your thoughts' },
  ];

  const selectedType = form.watch('category');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback Type</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => field.onChange(type.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <type.icon className={`h-4 w-4 ${selectedType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief summary of your feedback" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    selectedType === 'feature_request'
                      ? 'Describe the feature you\'d like to see...'
                      : selectedType === 'bug_report'
                      ? 'Describe what happened and steps to reproduce...'
                      : 'Share your thoughts...'
                  }
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default FeedbackForm;
