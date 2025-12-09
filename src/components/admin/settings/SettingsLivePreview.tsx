import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsLivePreviewProps {
  section: 'basic' | 'hero' | 'contact' | 'seo';
  data: Record<string, string>;
}

const SettingsLivePreview = ({ section, data }: SettingsLivePreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderBasicPreview = () => (
    <div className="space-y-4">
      <div className="text-center p-6 bg-background rounded-lg border">
        {data.siteLogo && (
          <img 
            src={data.siteLogo} 
            alt="Logo" 
            className="h-12 mx-auto mb-3 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <h1 className="text-xl font-bold text-foreground">
          {data.siteName || 'Your Site Name'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.tagline || 'Your tagline here'}
        </p>
        <p className="text-xs text-muted-foreground mt-3 max-w-xs mx-auto">
          {data.description || 'Your site description will appear here...'}
        </p>
      </div>
    </div>
  );

  const renderHeroPreview = () => (
    <div className="space-y-2">
      <div 
        className="relative rounded-lg overflow-hidden h-48 bg-cover bg-center"
        style={{ 
          backgroundImage: data.heroBackgroundImage 
            ? `url(${data.heroBackgroundImage})` 
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
          <h1 className="text-lg font-bold mb-1">
            {data.heroTitle || 'Hero Title'}
          </h1>
          <p className="text-sm opacity-90 mb-1">
            {data.heroSubtitle || 'Subtitle'}
          </p>
          <p className="text-xs opacity-80 max-w-[200px]">
            {data.heroDescription || 'Description...'}
          </p>
          {data.heroLocationText && (
            <span className="mt-2 text-xs bg-white/20 px-2 py-1 rounded">
              📍 {data.heroLocationText}
            </span>
          )}
          {data.heroCTAText && (
            <button className="mt-3 bg-white text-black text-xs px-3 py-1.5 rounded-md font-medium">
              {data.heroCTAText}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderContactPreview = () => (
    <div className="p-4 bg-background rounded-lg border space-y-3">
      <h3 className="font-semibold text-sm">Contact Information</h3>
      <div className="space-y-2 text-sm">
        {data.contactEmail && (
          <p className="flex items-center gap-2">
            <span className="text-muted-foreground">📧</span>
            {data.contactEmail}
          </p>
        )}
        {data.phone && (
          <p className="flex items-center gap-2">
            <span className="text-muted-foreground">📱</span>
            {data.phone}
          </p>
        )}
        {data.address && (
          <p className="flex items-center gap-2">
            <span className="text-muted-foreground">📍</span>
            {data.address}
          </p>
        )}
      </div>
    </div>
  );

  const renderSEOPreview = () => (
    <div className="space-y-3">
      <div className="p-4 bg-background rounded-lg border">
        <p className="text-xs text-muted-foreground mb-1">Search Result Preview</p>
        <div className="space-y-1">
          <h3 className="text-blue-600 text-sm font-medium truncate">
            {data.metaTitle || data.siteName || 'Page Title'}
          </h3>
          <p className="text-xs text-green-700 truncate">
            www.yoursite.com
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {data.metaDescription || 'Your meta description will appear here in search results...'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (section) {
      case 'basic':
        return renderBasicPreview();
      case 'hero':
        return renderHeroPreview();
      case 'contact':
        return renderContactPreview();
      case 'seo':
        return renderSEOPreview();
      default:
        return null;
    }
  };

  const sectionLabels: Record<string, string> = {
    basic: 'Site Identity',
    hero: 'Hero Section',
    contact: 'Contact Info',
    seo: 'SEO Preview',
  };

  return (
    <>
      {/* Toggle Button - Fixed on right edge */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-40 rounded-l-lg rounded-r-none border-r-0 h-auto py-3 px-2 shadow-lg transition-transform duration-300",
          isOpen && "translate-x-[280px]"
        )}
      >
        <div className="flex flex-col items-center gap-1">
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <Eye className="h-4 w-4" />
          <span className="text-[10px] writing-mode-vertical">Preview</span>
        </div>
      </Button>

      {/* Preview Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-[280px] bg-card border-l shadow-xl z-30 transition-transform duration-300 overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b sticky top-0 bg-card z-10">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Live Preview
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {sectionLabels[section] || 'Preview'}
          </p>
        </div>
        <div className="p-4">
          {renderPreview()}
        </div>
        <div className="p-4 border-t bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            Updates as you type
          </p>
        </div>
      </div>
    </>
  );
};

export default SettingsLivePreview;
