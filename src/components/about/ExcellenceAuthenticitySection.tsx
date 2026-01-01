import React from 'react';
import { Award, Heart } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { defaultSettings } from '@/hooks/settings/constants';

const ExcellenceAuthenticitySection = () => {
  const { settings } = useTenantSettings();
  const siteName = settings?.site_name || 'Our Team';
  const locationText = settings?.heroLocationText || 'the area';
  
  // Excellence card
  const excellenceTitle = settings?.aboutExcellenceTitle || defaultSettings.aboutExcellenceTitle;
  const excellenceDescription = settings?.aboutExcellenceDescription || defaultSettings.aboutExcellenceDescription;
  
  // Authenticity card - replace placeholder with actual location
  const authenticityTitle = settings?.aboutAuthenticityTitle || defaultSettings.aboutAuthenticityTitle;
  const authenticityDescriptionRaw = settings?.aboutAuthenticityDescription || defaultSettings.aboutAuthenticityDescription;
  const authenticityDescription = (authenticityDescriptionRaw || '').replace(/the area/g, locationText);
  
  // Closing quote - replace placeholder with actual location
  const closingQuoteRaw = settings?.aboutClosingQuote || defaultSettings.aboutClosingQuote;
  const closingQuote = (closingQuoteRaw || '').replace(/the area/g, locationText);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-8">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-foreground mb-8 text-center">What Sets Us Apart</h3>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-gradient-from to-gradient-to border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6">
              <Award className="h-8 w-8 text-primary-foreground" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-4">{excellenceTitle}</h4>
            <p className="text-muted-foreground leading-relaxed">
              {excellenceDescription}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary/80 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-4">{authenticityTitle}</h4>
            <p className="text-muted-foreground leading-relaxed">
              {authenticityDescription}
            </p>
          </div>
        </div>

        {/* Quote section */}
        <div className="bg-muted rounded-lg p-8 text-center">
          <blockquote className="text-xl text-foreground italic mb-6 leading-relaxed max-w-4xl mx-auto">
            "{closingQuote}"
          </blockquote>
          
          <div className="border-t border-border pt-6 max-w-md mx-auto">
            <p className="font-semibold text-foreground text-lg">— {siteName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcellenceAuthenticitySection;
