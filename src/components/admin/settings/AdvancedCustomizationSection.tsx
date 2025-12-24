import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { 
  Code, 
  AlertTriangle, 
  Save, 
  ChevronDown, 
  ChevronUp,
  Shield,
  Loader2,
  CheckCircle
} from 'lucide-react';

const AdvancedCustomizationSection = () => {
  const { settings, saveSetting, saving } = useSimplifiedSiteSettings();
  const { toast } = useToast();
  
  const [customCss, setCustomCss] = useState(settings?.customCss || '');
  const [customHeaderScripts, setCustomHeaderScripts] = useState(settings?.customHeaderScripts || '');
  const [customFooterScripts, setCustomFooterScripts] = useState(settings?.customFooterScripts || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cssValidation, setCssValidation] = useState<{ valid: boolean; error?: string } | null>(null);

  // Sync with settings when they load
  React.useEffect(() => {
    if (settings) {
      setCustomCss(settings.customCss || '');
      setCustomHeaderScripts(settings.customHeaderScripts || '');
      setCustomFooterScripts(settings.customFooterScripts || '');
    }
  }, [settings]);

  const validateCss = (css: string): { valid: boolean; error?: string } => {
    if (!css.trim()) return { valid: true };
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /javascript:/gi,
      /expression\(/gi,
      /@import\s+url\(/gi,
      /behavior:/gi,
      /-moz-binding:/gi,
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(css)) {
        return { valid: false, error: 'CSS contains potentially unsafe patterns' };
      }
    }
    
    // Basic syntax check - count braces
    const openBraces = (css.match(/{/g) || []).length;
    const closeBraces = (css.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      return { valid: false, error: 'Unmatched braces in CSS' };
    }
    
    return { valid: true };
  };

  const handleCssChange = (value: string) => {
    setCustomCss(value);
    const validation = validateCss(value);
    setCssValidation(validation);
  };

  const handleSave = async () => {
    const validation = validateCss(customCss);
    if (!validation.valid) {
      toast({
        title: 'Invalid CSS',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all([
        saveSetting('customCss', customCss),
        saveSetting('customHeaderScripts', customHeaderScripts),
        saveSetting('customFooterScripts', customFooterScripts),
      ]);
      
      toast({
        title: 'Saved',
        description: 'Advanced customizations have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save customizations.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Advanced Customization</CardTitle>
                  <CardDescription>
                    Custom CSS and JavaScript code injection
                  </CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Warning Banner */}
            <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900 dark:text-amber-100">
                Advanced Users Only
              </AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                  <li>These settings allow you to inject custom code into your website</li>
                  <li>Incorrect code can break your site's layout or functionality</li>
                  <li>JavaScript code has access to your page and visitor data</li>
                  <li>Test changes carefully before deploying to production</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Custom CSS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="customCss" className="text-base font-medium">
                  Custom CSS
                </Label>
                {cssValidation && (
                  <span className={`text-xs flex items-center gap-1 ${
                    cssValidation.valid ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {cssValidation.valid ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Valid
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        {cssValidation.error}
                      </>
                    )}
                  </span>
                )}
              </div>
              <Textarea
                id="customCss"
                value={customCss}
                onChange={(e) => handleCssChange(e.target.value)}
                placeholder={`/* Your custom CSS styles */
.my-custom-class {
  color: #333;
  font-size: 16px;
}

/* Override existing styles */
.hero-section {
  background-color: #f0f0f0;
}`}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Add custom CSS to override or extend default styling. Avoid using <code>!important</code> excessively.
              </p>
            </div>

            {/* Custom Header Scripts */}
            <div className="space-y-2">
              <Label htmlFor="headerScripts" className="text-base font-medium">
                Header Scripts
              </Label>
              <Textarea
                id="headerScripts"
                value={customHeaderScripts}
                onChange={(e) => setCustomHeaderScripts(e.target.value)}
                placeholder={`<!-- Scripts added before </head> -->
<script>
  // Your custom header script
</script>`}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                JavaScript code added before the closing <code>&lt;/head&gt;</code> tag. 
                Good for analytics, chat widgets, or meta scripts.
              </p>
            </div>

            {/* Custom Footer Scripts */}
            <div className="space-y-2">
              <Label htmlFor="footerScripts" className="text-base font-medium">
                Footer Scripts
              </Label>
              <Textarea
                id="footerScripts"
                value={customFooterScripts}
                onChange={(e) => setCustomFooterScripts(e.target.value)}
                placeholder={`<!-- Scripts added before </body> -->
<script>
  // Your custom footer script
  document.addEventListener('DOMContentLoaded', function() {
    // Code here runs after page load
  });
</script>`}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                JavaScript code added before the closing <code>&lt;/body&gt;</code> tag. 
                Best for scripts that need the DOM to be fully loaded.
              </p>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              className="w-full"
              disabled={isSaving || (cssValidation && !cssValidation.valid)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Advanced Settings
                </>
              )}
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AdvancedCustomizationSection;
