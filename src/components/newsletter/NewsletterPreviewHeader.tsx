
import React from 'react';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Smartphone, Monitor } from 'lucide-react';

interface NewsletterPreviewHeaderProps {
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
}

const NewsletterPreviewHeader = ({ viewMode, onViewModeChange }: NewsletterPreviewHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Newsletter Preview
        </CardTitle>
        <CardDescription>
          Preview your newsletter with Moxie's professional design
        </CardDescription>
      </div>
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('desktop')}
        >
          <Monitor className="h-4 w-4 mr-1" />
          Desktop
        </Button>
        <Button
          variant={viewMode === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('mobile')}
        >
          <Smartphone className="h-4 w-4 mr-1" />
          Mobile
        </Button>
      </div>
    </div>
  );
};

export default NewsletterPreviewHeader;
