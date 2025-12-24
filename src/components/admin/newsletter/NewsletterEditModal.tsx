import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';

const editSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
});

type EditFormData = z.infer<typeof editSchema>;

interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsletterEditModalProps {
  campaign: NewsletterCampaign | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: { subject: string; content: string }) => Promise<void>;
  isSaving: boolean;
}

const NewsletterEditModal = ({
  campaign,
  open,
  onClose,
  onSave,
  isSaving,
}: NewsletterEditModalProps) => {
  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      subject: '',
      content: '',
    },
  });

  useEffect(() => {
    if (campaign) {
      form.reset({
        subject: campaign.subject,
        content: campaign.content,
      });
    }
  }, [campaign, form]);

  const handleSubmit = async (data: EditFormData) => {
    if (!campaign) return;
    await onSave(campaign.id, { subject: data.subject, content: data.content });
    onClose();
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Newsletter Draft</DialogTitle>
          <DialogDescription>
            Update the subject and content of your newsletter draft.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Newsletter subject line" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Newsletter content..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterEditModal;
