import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Share2 } from 'lucide-react';

interface SEOPreviewProps {
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
}

const SEOPreview = ({ siteTitle, metaDescription, ogTitle, ogDescription, ogImage, favicon }: SEOPreviewProps) => {
  const displayTitle = ogTitle || siteTitle || 'Your Site Title';
  const displayDescription = ogDescription || metaDescription || 'Your site description';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Share2 className="h-4 w-4" />
            Social Media Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-card max-w-md">
            {ogImage && (
              <div className="aspect-[1.91/1] bg-muted">
                <img 
                  src={ogImage} 
                  alt="Open Graph preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Image not found</div>';
                    }
                  }}
                />
              </div>
            )}
            <div className="p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                example.com
              </div>
              <div className="font-semibold text-sm mb-1 line-clamp-2">
                {displayTitle}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {displayDescription}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4" />
            Browser Tab Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-3 bg-card">
            <div className="flex items-center gap-2 bg-muted p-2 rounded text-sm">
              <div className="w-4 h-4 bg-background rounded-sm flex items-center justify-center overflow-hidden">
                {favicon ? (
                  <img 
                    src={favicon} 
                    alt="Favicon preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-3 h-3 bg-primary rounded-sm"></div>';
                      }
                    }}
                  />
                ) : (
                  <div className="w-3 h-3 bg-primary rounded-sm"></div>
                )}
              </div>
              <span className="truncate font-medium">
                {siteTitle || 'Your Site Title'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOPreview;