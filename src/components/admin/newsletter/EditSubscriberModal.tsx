
import React, { useEffect } from 'react';
import { Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
  preferences: any;
}

interface EditSubscriberFormData {
  email: string;
  name: string;
  is_active: boolean;
}

interface EditSubscriberModalProps {
  subscriber: Subscriber | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: EditSubscriberFormData) => Promise<void>;
  isLoading: boolean;
}

const EditSubscriberModal = ({ subscriber, open, onClose, onSubmit, isLoading }: EditSubscriberModalProps) => {
  const form = useForm<EditSubscriberFormData>({
    defaultValues: {
      email: '',
      name: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (subscriber) {
      form.reset({
        email: subscriber.email,
        name: subscriber.name || '',
        is_active: subscriber.is_active,
      });
    }
  }, [subscriber, form]);

  const handleSubmit = async (data: EditSubscriberFormData) => {
    if (subscriber) {
      await onSubmit(subscriber.id, data);
      onClose();
    }
  };

  if (!subscriber) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Subscriber
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="subscriber@example.com"
              {...form.register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Subscriber's full name"
              {...form.register('name')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active Subscription</Label>
            <Switch
              id="is_active"
              checked={form.watch('is_active')}
              onCheckedChange={(checked) => form.setValue('is_active', checked)}
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscriberModal;
