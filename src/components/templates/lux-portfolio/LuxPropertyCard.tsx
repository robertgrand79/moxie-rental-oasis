import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/ui/optimized-image';
import { generateAddressSlug } from '@/utils/addressSlug';
import { ArrowRight } from 'lucide-react';

interface LuxPropertyCardProps {
  property: {
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
  };
  /** Render the card at a larger, featured size */
  featured?: boolean;
}

const LuxPropertyCard: React.FC<LuxPropertyCardProps> = ({ property, featured = false }) => {
  const addressSlug = generateAddressSlug(property.location);
  const heroImage =
    property.cover_image_url ||
    property.image_url ||
    (property.images && property.images[0]) ||
    '/placeholder.svg';

  const cityLabel = property.city || property.location?.split(',')[0] || '';

  return (
    <Link
      to={`/property/${addressSlug}`}
      className="group block"
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden rounded-sm ${
          featured ? 'aspect-[16/9]' : 'aspect-[3/4]'
        }`}
      >
        <OptimizedImage
          src={heroImage}
          alt={property.title}
          width={featured ? 1200 : 600}
          quality={50}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
      </div>

      {/* Text — no box, no border */}
      <div className="mt-5 space-y-2">
        {/* Overline — city */}
        {cityLabel && (
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            {cityLabel}
          </p>
        )}

        {/* Title */}
        <h3
          className={`font-serif text-foreground tracking-tight leading-snug ${
            featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
          }`}
        >
          {property.title}
        </h3>

        {/* Subtle details */}
        <div className="flex items-center gap-4 text-xs tracking-[0.15em] uppercase text-muted-foreground/70">
          <span>{property.bedrooms} Bed</span>
          <span>{property.bathrooms} Bath</span>
          <span>{property.max_guests} Guests</span>
        </div>

        {/* Price + CTA — revealed on hover */}
        <div className="flex items-center justify-between pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {property.price_per_night ? (
            <span className="text-sm text-muted-foreground">
              From <span className="text-foreground font-medium">${property.price_per_night}</span> / night
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase text-foreground">
            View Residence
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default LuxPropertyCard;
