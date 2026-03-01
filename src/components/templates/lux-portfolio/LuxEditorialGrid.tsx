import React from 'react';
import LuxPropertyCard from './LuxPropertyCard';

interface Property {
  id: string;
  title: string;
  location: string;
  city: string | null;
  price_per_night: number | null;
  image_url: string | null;
  cover_image_url: string | null;
  images: string[] | null;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
}

interface LuxEditorialGridProps {
  properties: Property[];
}

/**
 * An asymmetrical, editorial layout that alternates between
 * a full-width featured property and a 2-column split.
 */
const LuxEditorialGrid: React.FC<LuxEditorialGridProps> = ({ properties }) => {
  if (!properties || properties.length === 0) return null;

  // Build layout chunks: feature (1 item) → pair (2 items) → feature → pair …
  const chunks: { type: 'feature' | 'pair'; items: Property[] }[] = [];
  let i = 0;
  while (i < properties.length) {
    if (chunks.length % 2 === 0) {
      // Feature
      chunks.push({ type: 'feature', items: [properties[i]] });
      i += 1;
    } else {
      // Pair
      const pair = properties.slice(i, i + 2);
      chunks.push({ type: 'pair', items: pair });
      i += pair.length;
    }
  }

  return (
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Residences
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight mb-20">
          Explore the Collection
        </h2>

        <div className="space-y-24">
          {chunks.map((chunk, idx) => {
            if (chunk.type === 'feature') {
              return (
                <div key={idx}>
                  <LuxPropertyCard property={chunk.items[0]} featured />
                </div>
              );
            }
            // Pair — 2-column
            return (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {chunk.items.map((prop) => (
                  <LuxPropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LuxEditorialGrid;
