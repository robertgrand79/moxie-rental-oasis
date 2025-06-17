
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

interface EmbeddedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingUrl: string;
  propertyTitle: string;
}

const EmbeddedBookingModal = ({ isOpen, onClose, bookingUrl, propertyTitle }: EmbeddedBookingModalProps) => {
  const handleExternalFallback = () => {
    window.open(bookingUrl, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Book {propertyTitle}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExternalFallback}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative">
          <iframe
            src={bookingUrl}
            className="w-full h-full border-0"
            title={`Book ${propertyTitle}`}
            allow="payment; camera; microphone; geolocation"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>
        
        <div className="px-6 py-3 border-t bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            Having trouble? <button onClick={handleExternalFallback} className="text-primary underline">Open booking page in new tab</button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbeddedBookingModal;
