import React from 'react';
import { Plane, Heart } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface OwnerTravelsSectionProps {
  className?: string;
}

const OwnerTravelsSection = ({ className = '' }: OwnerTravelsSectionProps) => {
  const { settings } = useTenantSettings();
  
  const founderNames = settings?.founderNames || 'Our Hosts';
  const ownerTravelsTitle = settings?.ownerTravelsTitle || `${founderNames}'s Travels`;
  const ownerTravelsDescription = settings?.ownerTravelsDescription || 
    "Travel is at the heart of what we do. Follow along as we explore destinations, discover hidden gems, and share the experiences that inspire our hospitality.";
  const ownerTravelsImageUrl = settings?.ownerTravelsImageUrl;

  return (
    <div className={`bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-8 mb-8 ${className}`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Owner Photo */}
        <div className="flex-shrink-0">
          {ownerTravelsImageUrl ? (
            <img 
              src={ownerTravelsImageUrl} 
              alt={founderNames}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-background shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shadow-lg">
              <Plane className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Heart className="w-5 h-5 text-primary fill-primary/30" />
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Personal Adventures
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {ownerTravelsTitle}
          </h2>
          
          <p className="text-muted-foreground max-w-2xl">
            {ownerTravelsDescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerTravelsSection;
