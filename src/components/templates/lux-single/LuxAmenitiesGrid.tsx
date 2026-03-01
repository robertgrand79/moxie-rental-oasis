import React from 'react';
import {
  Wifi, Car, Utensils, Snowflake, Flame, Tv, WashingMachine,
  Dumbbell, ShowerHead, Coffee, Wind, TreePine, Dog, Waves,
  Sparkles, Home, Lock, Sun,
} from 'lucide-react';

interface LuxAmenitiesGridProps {
  amenities: string | undefined;
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  parking: Car,
  kitchen: Utensils,
  'air conditioning': Snowflake,
  ac: Snowflake,
  heating: Flame,
  fireplace: Flame,
  tv: Tv,
  washer: WashingMachine,
  dryer: WashingMachine,
  gym: Dumbbell,
  shower: ShowerHead,
  coffee: Coffee,
  'hair dryer': Wind,
  garden: TreePine,
  patio: TreePine,
  'pet friendly': Dog,
  pets: Dog,
  pool: Waves,
  'hot tub': Waves,
  jacuzzi: Waves,
  'self check-in': Lock,
  deck: Sun,
};

const getIcon = (amenity: string): React.ElementType => {
  const lower = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return Sparkles;
};

const LuxAmenitiesGrid: React.FC<LuxAmenitiesGridProps> = ({ amenities }) => {
  if (!amenities) return null;

  const amenityList = amenities
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  if (amenityList.length === 0) return null;

  return (
    <section className="py-24 md:py-32 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <p className="uppercase tracking-widest text-sm text-muted-foreground mb-12">
          Amenities
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-8">
          {amenityList.map((amenity) => {
            const Icon = getIcon(amenity);
            return (
              <div key={amenity} className="flex items-center gap-3 group">
                <Icon className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 group-hover:text-foreground transition-colors duration-300" strokeWidth={1.5} />
                <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                  {amenity}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LuxAmenitiesGrid;
