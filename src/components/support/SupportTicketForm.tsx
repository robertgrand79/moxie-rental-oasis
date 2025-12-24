import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ticketSchema = z.object({
  category: z.enum(['technical', 'billing', 'booking', 'general', 'feature_request', 'bug_report']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more details (at least 20 characters)'),
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface SupportTicketFormProps {
  onSuccess?: () => void;
}

const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: 'general',
      priority: 'medium',
      subject: '',
      description: '',
      email: user?.email || '',
      name: '',
    },
  });

  const submitTicket = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const { error } = await supabase.from('support_tickets').insert([{
        user_id: user?.id,
        category: data.category,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
        email: data.email,
        name: data.name || null,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Support ticket submitted',
        description: 'We\'ll get back to you as soon as possible.',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TicketFormData) => {
    submitTicket.mutate(data);
  };

  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'booking', label: 'Booking Issue' },
    { value: 'general', label: 'General Question' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'bug_report', label: 'Bug Report' },
  ];

  const priorities = [
    { value: 'low', label: 'Low - General question' },
    { value: 'medium', label: 'Medium - Need help soon' },
    { value: 'high', label: 'High - Urgent issue' },
    { value: 'critical', label: 'Critical - Site/payments down' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorities.map((pri) => (
                      <SelectItem key={pri.value} value={pri.value}>
                        {pri.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of your issue" {...field} />
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
                  placeholder="Please provide as much detail as possible..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={submitTicket.isPending}>
          {submitTicket.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Ticket
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SupportTicketForm;
