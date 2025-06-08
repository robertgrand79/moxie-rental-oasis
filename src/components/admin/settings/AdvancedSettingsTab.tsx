
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Code, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedSettingsTabProps {
  analyticsData: any;
  setAnalyticsData: (data: any) => void;
  updateSetting: (key: string, value: any) => Promise<boolean>;
}

const AdvancedSettingsTab = ({ analyticsData, setAnalyticsData, updateSetting }: AdvancedSettingsTabProps) => {
  const { toast } = useToast();

  const handleSaveAdvancedSettings = async () => {
    const settingsToSave = [
      { key: 'customHeaderScripts', value: analyticsData.customHeaderScripts },
      { key: 'customFooterScripts', value: analyticsData.customFooterScripts },
      { key: 'customCss', value: analyticsData.customCss },
    ];

    let allSuccessful = true;
    for (const setting of settingsToSave) {
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      toast({
        title: "Advanced Settings Saved",
        description: "Your custom code and scripts have been successfully updated.",
      });
    }
  };

  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Code className="h-5 w-5 mr-2 text-purple-600" />
          Advanced Settings
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Add custom CSS and JavaScript code to your website
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900 mb-1">Advanced Users Only</h4>
            <p className="text-sm text-amber-800">
              These settings allow you to add custom code to your website. Only modify these if you understand HTML, CSS, and JavaScript. Incorrect code can break your website.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="customHeaderScripts">Custom Header Scripts</Label>
          <Textarea
            id="customHeaderScripts"
            value={analyticsData.customHeaderScripts}
            onChange={(e) => setAnalyticsData({ ...analyticsData, customHeaderScripts: e.target.value })}
            placeholder="JavaScript code to be added before </head>"
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Code added here will be inserted before the closing &lt;/head&gt; tag
          </p>
        </div>

        <div>
          <Label htmlFor="customFooterScripts">Custom Footer Scripts</Label>
          <Textarea
            id="customFooterScripts"
            value={analyticsData.customFooterScripts}
            onChange={(e) => setAnalyticsData({ ...analyticsData, customFooterScripts: e.target.value })}
            placeholder="JavaScript code to be added before </body>"
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Code added here will be inserted before the closing &lt;/body&gt; tag
          </p>
        </div>

        <div>
          <Label htmlFor="customCss">Custom CSS</Label>
          <Textarea
            id="customCss"
            value={analyticsData.customCss}
            onChange={(e) => setAnalyticsData({ ...analyticsData, customCss: e.target.value })}
            placeholder="/* Your custom CSS styles */
.custom-class {
  color: #333;
}"
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Custom CSS styles to override default styling
          </p>
        </div>

        <Button onClick={handleSaveAdvancedSettings} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Advanced Settings
        </Button>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default AdvancedSettingsTab;
