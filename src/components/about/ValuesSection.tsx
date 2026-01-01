import React from 'react';
import { CheckCircle, Zap, Star, HandHeart } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { defaultSettings } from '@/hooks/settings/constants';

interface ValueCard {
  icon: string;
  title: string;
  description: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckCircle,
  Zap,
  Star,
  HandHeart,
};

const parseCards = (jsonString: string | undefined, fallback: string): ValueCard[] => {
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

const ValuesSection = () => {
  const { settings } = useTenantSettings();
  const valuesCards = parseCards(settings?.aboutValuesCards, defaultSettings.aboutValuesCards);

  const cardStyles = [
    { bgColor: "bg-gradient-to-br from-gradient-from to-gradient-to", iconBg: "bg-primary" },
    { bgColor: "bg-muted", iconBg: "bg-primary/80" },
    { bgColor: "bg-accent", iconBg: "bg-primary" },
    { bgColor: "bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to", iconBg: "bg-primary/80" }
  ];

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-8">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Our Values</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {valuesCards.slice(0, 4).map((card, index) => {
            const IconComponent = iconMap[card.icon] || CheckCircle;
            const style = cardStyles[index % 4];
            return (
              <div key={index} className={`${style.bgColor} border-border border rounded-lg p-6 text-center h-full`}>
                <div className={`w-12 h-12 ${style.iconBg} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-3 text-lg">{card.title}</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ValuesSection;
