
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X, Loader2 } from 'lucide-react';

interface EmbeddedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingUrl: string;
  propertyTitle: string;
}

const EmbeddedBookingModal = ({ isOpen, onClose, bookingUrl, propertyTitle }: EmbeddedBookingModalProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleExternalFallback = () => {
    window.open(bookingUrl, '_blank');
    onClose();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 gap-0">
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExternalFallback}
              className="flex items-center gap-2 text-xs"
            >
              <ExternalLink className="h-3 w-3" />
              Open in New Tab
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 relative bg-white">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="flex items-center gap-3 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading booking interface...</span>
              </div>
            </div>
          )}
          
          {/* Embedded Booking Interface */}
          <iframe
            src={bookingUrl}
            className="w-full h-full border-0"
            title={`Book ${propertyTitle}`}
            allow="payment; camera; microphone; geolocation"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            onLoad={handleIframeLoad}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbeddedBookingModal;
