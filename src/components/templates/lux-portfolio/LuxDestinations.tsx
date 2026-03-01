import React from 'react';
import OptimizedImage from '@/components/ui/optimized-image';

interface Destination {
  city: string;
  image: string;
  count: number;
}

interface LuxDestinationsProps {
  destinations: Destination[];
}

const LuxDestinations: React.FC<LuxDestinationsProps> = ({ destinations }) => {
  if (!destinations || destinations.length === 0) return null;

  return (
    <section className="py-32 border-t border-primary/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Destinations
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight mb-20">
          Where We Welcome You
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {destinations.map((dest) => (
            <div key={dest.city} className="group cursor-pointer">
              {/* Tall portrait mask */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                <OptimizedImage
                  src={dest.image}
                  alt={dest.city}
                  width={400}
                  quality={50}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-serif text-xl text-white tracking-tight">
                    {dest.city}
                  </h3>
                  <p className="text-xs tracking-[0.2em] uppercase text-white/60 mt-1">
                    {dest.count} {dest.count === 1 ? 'Residence' : 'Residences'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxDestinations;
