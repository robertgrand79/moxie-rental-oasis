
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EventUrlFieldsProps {
  imageUrl: string;
  websiteUrl: string;
  ticketUrl: string;
  onImageUrlChange: (url: string) => void;
  onWebsiteUrlChange: (url: string) => void;
  onTicketUrlChange: (url: string) => void;
}

const EventUrlFields = ({
  imageUrl,
  websiteUrl,
  ticketUrl,
  onImageUrlChange,
  onWebsiteUrlChange,
  onTicketUrlChange
}: EventUrlFieldsProps) => {
  return (
    <>
      <div className="md:col-span-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          type="url"
          placeholder="https://..."
          value={websiteUrl}
          onChange={(e) => onWebsiteUrlChange(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="ticket_url">Ticket URL</Label>
        <Input
          id="ticket_url"
          type="url"
          placeholder="https://..."
          value={ticketUrl}
          onChange={(e) => onTicketUrlChange(e.target.value)}
        />
      </div>
    </>
  );
};

export default EventUrlFields;
