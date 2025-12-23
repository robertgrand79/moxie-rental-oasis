import React from 'react';
import { Target, Mountain, Coffee } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { defaultSettings } from '@/hooks/settings/constants';

interface MissionCard {
  icon: string;
  title: string;
  description: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mountain,
  Coffee,
  Target,
};

const parseCards = (jsonString: string | undefined, fallback: string): MissionCard[] => {
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

const MissionSection = () => {
  const { settings } = useTenantSettings();
  const siteName = settings.site_name || 'our company';
  const missionStatement = settings.missionStatement || 
    `Our mission at ${siteName} is to create remarkable vacation experiences. We aim to combine outdoor adventures, culinary delights, and stylish accommodations to offer our guests a truly unforgettable stay.`;
  const missionDescription = settings.missionDescription || 
    'With our expertise in hospitality, home improvement, and interior design, we are dedicated to providing exceptional service and curating experiences that reflect the unique charm of our destinations.';
  
  const missionCards = parseCards(settings.aboutMissionCards, defaultSettings.aboutMissionCards);

  const cardStyles = ["bg-accent", "bg-muted"];
  const iconBgs = ["bg-gray-700", "bg-gray-500"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        {/* Mission content - centered */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
          </div>
          
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-4">
            {missionStatement}
          </p>
          
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {missionDescription}
          </p>
        </div>

        {/* Feature boxes below mission */}
        <div className="grid md:grid-cols-2 gap-6">
          {missionCards.slice(0, 2).map((card, index) => {
            const IconComponent = iconMap[card.icon] || Mountain;
            return (
              <div key={index} className={`${cardStyles[index % 2]} border border-gray-200 rounded-lg p-6 text-center`}>
                <div className={`w-16 h-16 ${iconBgs[index % 2]} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h4>
                <p className="text-gray-600 leading-relaxed">
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

export default MissionSection;
