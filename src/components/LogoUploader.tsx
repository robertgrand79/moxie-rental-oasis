
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Trash2, Save, Loader2 } from 'lucide-react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const LogoUploader = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { settings, saveSetting, loading } = useStableSiteSettings();

  // Load from database settings
  useEffect(() => {
    if (!loading && settings) {
      setLogo(settings.siteLogo || null);
      setFavicon(settings.favicon || null);
    }
  }, [settings, loading]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'logo') {
          setLogo(result);
        } else {
          setFavicon(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBranding = async () => {
    setIsSaving(true);
    try {
      // Save to database instead of localStorage
      const promises = [];
      
      if (logo !== settings?.siteLogo) {
        promises.push(saveSetting('siteLogo', logo || ''));
      }
      
      if (favicon !== settings?.favicon) {
        promises.push(saveSetting('favicon', favicon || ''));
      }

      await Promise.all(promises);
      
      // Apply favicon if provided
      if (favicon) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = favicon;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = favicon;
          document.head.appendChild(newLink);
        }
      }

      toast({
        title: "Branding Saved",
        description: "Your logos and branding have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: "Error",
        description: "Failed to save branding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFavicon = () => {
    setFavicon(null);
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Logo & Branding
          </CardTitle>
          <CardDescription>
            Upload your logo and favicon to customize your site's branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <Label>Site Logo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {logo ? (
                  <div className="space-y-4">
                    <img
                      src={logo}
                      alt="Logo preview"
                      className="max-w-full max-h-32 mx-auto object-contain"
                    />
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Replace
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeLogo}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload your site logo (PNG, JPG, SVG)
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-4">
              <Label>Favicon</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {favicon ? (
                  <div className="space-y-4">
                    <img
                      src={favicon}
                      alt="Favicon preview"
                      className="w-16 h-16 mx-auto object-contain"
                    />
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => faviconInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Replace
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeFavicon}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload favicon (16x16 or 32x32 px)
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => faviconInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                )}
                <Input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'favicon')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <Button onClick={saveBranding} className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Branding
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Logo Requirements:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Recommended size: 200-400px wide</li>
                <li>Format: PNG with transparency preferred</li>
                <li>Max file size: 5MB</li>
              </ul>
            </div>
            <div>
              <strong className="text-foreground">Favicon Requirements:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Size: 16x16 or 32x32 pixels</li>
                <li>Format: ICO, PNG, or SVG</li>
                <li>Simple design works best at small sizes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogoUploader;
