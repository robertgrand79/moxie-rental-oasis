
import React from 'react';

interface AmenityCardProps {
  amenity: string;
  icon: React.ComponentType<{ className?: string }>;
  config: {
    color: string;
    bgColor: string;
    shadowColor: string;
  };
  isMobile: boolean;
}

const AmenityCard = ({ amenity, icon: IconComponent, config, isMobile }: AmenityCardProps) => {
  if (isMobile) {
    return (
      <div 
        className={`p-4 rounded-xl border ${config.bgColor} ${config.shadowColor} shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl backdrop-blur-sm`}
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-sm">
            <IconComponent className={`h-5 w-5 ${config.color}`} />
          </div>
          <span className="font-medium text-foreground text-sm capitalize leading-tight">{amenity}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-5 rounded-xl border ${config.bgColor} ${config.shadowColor} shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm`}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-md">
          <IconComponent className={`h-6 w-6 ${config.color}`} />
        </div>
        <span className="font-semibold text-foreground capitalize leading-tight">{amenity}</span>
      </div>
    </div>
  );
};

export default AmenityCard;
