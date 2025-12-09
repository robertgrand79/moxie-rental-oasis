
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { CheckCircle } from 'lucide-react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

interface QuickSetupProgressProps {
  isBasicComplete: boolean;
  isHeroComplete: boolean;
  isSocialComplete: boolean;
}

const QuickSetupProgress = ({ isBasicComplete, isHeroComplete, isSocialComplete }: QuickSetupProgressProps) => {
  const { settings } = useSimplifiedSiteSettings();
  
  const isEmailSetupComplete = settings.emailSetupVerified === 'true' || settings.emailSetupVerified === true;

  return (
    <EnhancedCard variant="glass" className="border-l-4 border-l-blue-500">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center text-blue-700">
          <CheckCircle className="h-5 w-5 mr-2" />
          Quick Setup Progress
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Complete these essential settings to get your site ready
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg border-2 ${isBasicComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Basic Info</span>
              {isBasicComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">Site name, description, contact</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${isHeroComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Hero Section</span>
              {isHeroComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">Homepage main content</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${isSocialComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Social Links</span>
              {isSocialComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">Connect social media</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${isEmailSetupComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Email Setup</span>
              {isEmailSetupComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">Newsletter & notifications</p>
          </div>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default QuickSetupProgress;
