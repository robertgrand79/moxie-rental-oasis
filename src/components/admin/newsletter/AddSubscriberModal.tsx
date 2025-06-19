
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddSubscriberFormData } from '@/components/newsletter/types';

interface AddSubscriberModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddSubscriberFormData) => Promise<void>;
  isLoading: boolean;
}

const AddSubscriberModal = ({ open, onClose, onSubmit, isLoading }: AddSubscriberModalProps) => {
  const [formData, setFormData] = useState<AddSubscriberFormData>({
    email: '',
    name: '',
    phone: '',
    emailOptIn: true,
    smsOptIn: false,
    communicationPreferences: {
      frequency: 'weekly',
      preferredTime: 'morning'
    },
    contactSource: 'manual_add'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
    setFormData({
      email: '',
      name: '',
      phone: '',
      emailOptIn: true,
      smsOptIn: false,
      communicationPreferences: {
        frequency: 'weekly',
        preferredTime: 'morning'
      },
      contactSource: 'manual_add'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Communication Preferences</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailOptIn"
                checked={formData.emailOptIn}
                onCheckedChange={(checked) => setFormData({ ...formData, emailOptIn: checked as boolean })}
              />
              <Label htmlFor="emailOptIn">Email newsletters</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsOptIn"
                checked={formData.smsOptIn}
                onCheckedChange={(checked) => setFormData({ ...formData, smsOptIn: checked as boolean })}
              />
              <Label htmlFor="smsOptIn">SMS updates</Label>
            </div>
          </div>
          <div>
            <Label>Frequency</Label>
            <Select
              value={formData.communicationPreferences.frequency}
              onValueChange={(value) => setFormData({
                ...formData,
                communicationPreferences: {
                  ...formData.communicationPreferences,
                  frequency: value as 'daily' | 'weekly' | 'monthly'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubscriberModal;
