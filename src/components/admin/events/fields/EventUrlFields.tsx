
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { fetchWebsiteImage } from '@/lib/api/fetchWebsiteImage';
import { toast } from 'sonner';

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
  const [isFetchingImage, setIsFetchingImage] = useState(false);

  const handleFetchImage = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL first');
      return;
    }

    setIsFetchingImage(true);
    try {
      const newImageUrl = await fetchWebsiteImage(websiteUrl);
      onImageUrlChange(newImageUrl);
      toast.success('Image fetched and uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch image');
    } finally {
      setIsFetchingImage(false);
    }
  };

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
        <div className="flex gap-2">
          <Input
            id="website_url"
            type="url"
            placeholder="https://..."
            value={websiteUrl}
            onChange={(e) => onWebsiteUrlChange(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleFetchImage}
            disabled={isFetchingImage || !websiteUrl}
            title="Fetch image from website"
          >
            {isFetchingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Click the button to auto-fetch the event image from this URL
        </p>
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
