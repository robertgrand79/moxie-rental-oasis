import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { 
  Sparkles, 
  FileText, 
  Image, 
  Loader2, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface DefaultContent {
  siteName: string;
  tagline: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroCTAText: string;
  aboutTitle: string;
  aboutDescription: string;
  missionStatement: string;
}

const defaultContentTemplates: DefaultContent = {
  siteName: 'Your Vacation Rentals',
  tagline: 'Discover Your Perfect Getaway',
  description: 'Find exceptional vacation rental properties for your next adventure. Book with confidence and create lasting memories with family and friends.',
  heroTitle: 'Welcome to Paradise',
  heroSubtitle: 'Unforgettable Stays Await',
  heroDescription: 'Discover handpicked vacation rentals that offer comfort, style, and unforgettable experiences in the most beautiful destinations.',
  heroCTAText: 'Browse Properties',
  aboutTitle: 'About Us',
  aboutDescription: 'We are passionate about creating memorable vacation experiences. Our carefully curated selection of properties ensures that every stay is exceptional.',
  missionStatement: 'Our mission is to connect travelers with unique, quality vacation rentals while providing outstanding hospitality and personalized service.',
};

const DefaultContentGenerator = () => {
  const { settings, saveSettings } = useSimplifiedSiteSettings();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [appliedFields, setAppliedFields] = useState<string[]>([]);

  const emptyFields = Object.entries(defaultContentTemplates).filter(([key]) => {
    const value = settings?.[key as keyof typeof settings];
    return !value || (typeof value === 'string' && value.trim() === '');
  });

  const handleApplyDefaults = async () => {
    setIsApplying(true);
    try {
      const fieldsToUpdate: Record<string, string> = {};
      const applied: string[] = [];

      emptyFields.forEach(([key, defaultValue]) => {
        fieldsToUpdate[key] = defaultValue;
        applied.push(key);
      });

      if (Object.keys(fieldsToUpdate).length > 0) {
        await saveSettings(fieldsToUpdate);
        setAppliedFields(applied);
        
        toast({
          title: 'Default Content Applied',
          description: `${applied.length} fields have been populated with starter content.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply default content.',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (emptyFields.length === 0) {
    return null; // Don't show if all fields are filled
  }

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick Start Content
        </CardTitle>
        <CardDescription>
          Get started quickly with professional placeholder content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{emptyFields.length} fields</strong> are empty. Apply default content to get started quickly, then customize to match your brand.
          </AlertDescription>
        </Alert>

        {/* Preview of what will be filled */}
        <div className="space-y-2 text-sm">
          <p className="font-medium text-muted-foreground">Empty fields to be filled:</p>
          <div className="flex flex-wrap gap-2">
            {emptyFields.map(([key]) => (
              <span 
                key={key}
                className="px-2 py-1 bg-muted rounded-md text-xs font-medium capitalize"
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            ))}
          </div>
        </div>

        {appliedFields.length > 0 && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Successfully applied default content to {appliedFields.length} fields. 
              Remember to customize this content to match your brand!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={handleApplyDefaults}
            disabled={isApplying}
            className="flex-1"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Apply Default Content
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          This will only fill empty fields. Existing content will not be overwritten.
        </p>
      </CardContent>
    </Card>
  );
};

export default DefaultContentGenerator;
