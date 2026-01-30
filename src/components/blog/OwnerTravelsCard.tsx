import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface OwnerTravelsCardProps {
  hasOwnerTravelsPosts: boolean;
}

const OwnerTravelsCard = ({ hasOwnerTravelsPosts }: OwnerTravelsCardProps) => {
  const { settings } = useTenantSettings();
  
  const founderNames = settings?.founderNames || 'Our Hosts';
  const ownerTravelsImageUrl = settings?.ownerTravelsImageUrl;

  // Don't show if no owner travels posts exist
  if (!hasOwnerTravelsPosts) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg text-foreground">Follow Our Adventures</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {ownerTravelsImageUrl && (
          <img
            src={ownerTravelsImageUrl}
            alt={founderNames}
            className="w-full h-24 object-cover rounded-lg mb-4"
            loading="lazy"
          />
        )}
        <p className="text-sm text-muted-foreground mb-4">
          See where {founderNames} have traveled and get inspired for your next adventure.
        </p>
        <Link 
          to="/blog?category=owner-travels"
          className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center"
        >
          View {founderNames}'s Travels
          <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default OwnerTravelsCard;
