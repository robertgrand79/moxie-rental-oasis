import React from 'react';
import { Home, Award, Heart, Star } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { defaultSettings } from '@/hooks/settings/constants';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Award,
  Heart,
  Star,
};

const parseCards = (jsonString: string | undefined, fallback: string): FeatureCard[] => {
  try {
    const parsed = JSON.parse(jsonString || fallback);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    try {
      return JSON.parse(fallback);
    } catch {
      return [];
    }
  }
};

const AboutIntroduction = () => {
  const { settings } = useTenantSettings();
  const siteName = settings.site_name || 'Our Team';
  const aboutTitle = settings.aboutTitle || 'Meet Our Team';
  const aboutDescription = settings.aboutDescription || 
    `Welcome to ${siteName}! We're dedicated to providing exceptional vacation rental experiences with personalized service and attention to detail.`;
  const aboutImageUrl = settings.aboutImageUrl;
  const founderNames = settings.founderNames;
  
  // Extended settings with fallbacks
  const featureCards = parseCards(settings.aboutFeatureCards, defaultSettings.aboutFeatureCards);
  const founderQuote = settings.aboutFounderQuote || defaultSettings.aboutFounderQuote;
  const tagline = settings.aboutTagline || defaultSettings.aboutTagline;
  const tags = (settings.aboutTags || defaultSettings.aboutTags).split(',').map(t => t.trim()).filter(Boolean);

  const cardStyles = [
    "bg-gradient-to-br from-gradient-from to-gradient-to",
    "bg-muted",
    "bg-accent",
    "bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to"
  ];

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">{aboutTitle}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {aboutDescription}
            </p>
          </div>

          {/* Hero Photo Section - Only show if configured */}
          {aboutImageUrl && (
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl">
                <OptimizedImage
                  src={aboutImageUrl}
                  alt={`${siteName} team`}
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                  priority={true}
                />
              </div>
            </div>
          )}

          {/* Feature boxes with muted backgrounds */}
          <div className="grid grid-cols-2 gap-4">
            {featureCards.slice(0, 4).map((card, index) => {
              const IconComponent = iconMap[card.icon] || Home;
              return (
                <div key={index} className={`${cardStyles[index % 4]} border border-border rounded-lg p-4 text-center`}>
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm mb-2">{card.title}</h4>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
              );
            })}
          </div>

          {/* Quote section - Only show if founder names configured */}
          {founderNames && (
            <div className="bg-muted rounded-lg p-6 border-l-4 border-primary">
              <blockquote className="text-lg text-muted-foreground italic mb-4">
                "{founderQuote}"
              </blockquote>
              <p className="font-semibold text-foreground">— {founderNames}</p>
            </div>
          )}

          {/* Bottom tagline and tags */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{tagline}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className={`${index % 2 === 0 ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground'} px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutIntroduction;
