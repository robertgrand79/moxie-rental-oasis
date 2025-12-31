import React, { useState } from 'react';
import { Monitor, X, Tv, Users, MonitorPlay } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PreviewMode = 'welcome' | 'guest_portal' | 'signage';

interface TVPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyName: string;
  initialMode?: PreviewMode;
}

const TVPreviewModal: React.FC<TVPreviewModalProps> = ({
  open,
  onOpenChange,
  propertyId,
  propertyName,
  initialMode = 'welcome',
}) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>(initialMode);

  const getPreviewUrl = () => {
    const baseUrl = window.location.origin;
    switch (previewMode) {
      case 'welcome':
        return `${baseUrl}/tv/${propertyId}?preview=true`;
      case 'guest_portal':
        return `${baseUrl}/tv/${propertyId}/portal?preview=true`;
      case 'signage':
        return `${baseUrl}/tv/${propertyId}/signage?preview=true`;
      default:
        return `${baseUrl}/tv/${propertyId}?preview=true`;
    }
  };

  const getModeIcon = (mode: PreviewMode) => {
    switch (mode) {
      case 'welcome': return <Tv className="h-4 w-4" />;
      case 'guest_portal': return <Users className="h-4 w-4" />;
      case 'signage': return <MonitorPlay className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: PreviewMode) => {
    switch (mode) {
      case 'welcome': return 'Welcome Screen';
      case 'guest_portal': return 'Guest Portal';
      case 'signage': return 'Digital Signage';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-primary" />
            <div>
              <DialogTitle className="text-lg">TV Preview</DialogTitle>
              <p className="text-sm text-muted-foreground">{propertyName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Selector */}
            <Select value={previewMode} onValueChange={(v) => setPreviewMode(v as PreviewMode)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    Welcome Screen
                  </div>
                </SelectItem>
                <SelectItem value="guest_portal">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Guest Portal
                  </div>
                </SelectItem>
                <SelectItem value="signage">
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="h-4 w-4" />
                    Digital Signage
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="secondary" className="flex items-center gap-1">
              {getModeIcon(previewMode)}
              {getModeLabel(previewMode)}
            </Badge>
          </div>
        </div>

        {/* Preview Banner */}
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium text-center">
          Preview Mode - This is how your TV will appear to guests
        </div>

        {/* Preview Frame */}
        <div className="flex-1 bg-muted p-4 overflow-hidden">
          <div className="w-full h-full relative bg-black rounded-lg overflow-hidden shadow-2xl">
            {/* TV Bezel Effect */}
            <div className="absolute inset-0 rounded-lg ring-4 ring-gray-800 pointer-events-none z-10" />
            
            {/* Iframe Container - 16:9 aspect ratio */}
            <div className="w-full h-full">
              <iframe
                key={previewMode} // Force reload when mode changes
                src={getPreviewUrl()}
                className="w-full h-full border-0"
                title="TV Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Tip: The actual TV display may vary slightly based on screen size and resolution
          </p>
          <Button variant="outline" onClick={() => window.open(getPreviewUrl(), '_blank')}>
            Open in New Tab
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TVPreviewModal;
