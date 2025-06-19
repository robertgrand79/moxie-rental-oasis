
import React from 'react';
import { Plus } from 'lucide-react';
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

interface AddSubscriberFormData {
  email: string;
  name: string;
  is_active: boolean;
}

interface AddSubscriberModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddSubscriberFormData) => Promise<void>;
  isLoading: boolean;
}

const AddSubscriberModal = ({ open, onClose, onSubmit, isLoading }: AddSubscriberModalProps) => {
  const form = useForm<AddSubscriberFormData>({
    defaultValues: {
      email: '',
      name: '',
      is_active: true,
    },
  });

  const handleSubmit = async (data: AddSubscriberFormData) => {
    await onSubmit(data);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Subscriber
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Subscriber'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubscriberModal;
