import React, { useState } from 'react';
import { 
  MapPin, Utensils, Activity, ShoppingBag, Car, 
  Star, Clock, Globe, Phone, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tvStyles } from '@/components/tv/TVLayout';
import TVFocusableButton from '@/components/tv/TVFocusableButton';
import { useGuidebook, GuidebookContent } from '@/hooks/useGuidebookManagement';

interface TVLocalGuideProps {
  propertyId?: string;
}

type Category = 'restaurants' | 'activities' | 'shopping' | 'transportation';

/**
 * TVLocalGuide - Local recommendations display for TV
 * 
 * Features:
 * - Category-based navigation
 * - Card layout with D-pad navigation
 * - Restaurant ratings
 * - Transportation info
 */
const TVLocalGuide: React.FC<TVLocalGuideProps> = ({ propertyId }) => {
  const { data: guidebook, isLoading } = useGuidebook(propertyId);
  const [activeCategory, setActiveCategory] = useState<Category>('restaurants');
  
  const content: GuidebookContent = guidebook?.content || {};
  const recommendations = content.local_recommendations;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className={cn(tvStyles.iconLarge, "animate-spin text-primary")} />
      </div>
    );
  }

  const categories = [
    { id: 'restaurants', label: 'Restaurants', icon: Utensils },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'transportation', label: 'Transportation', icon: Car },
  ];

  return (
    <div className="space-y-6">
      <h2 className={tvStyles.heading2}>Local Guide</h2>
      
      {/* Category Tabs */}
      <div className="flex gap-4 flex-wrap">
        {categories.map(({ id, label, icon: Icon }) => (
          <TVFocusableButton
            key={id}
            variant={activeCategory === id ? "default" : "outline"}
            onClick={() => setActiveCategory(id as Category)}
            className="gap-3"
          >
            <Icon className="h-6 w-6" />
            {label}
          </TVFocusableButton>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeCategory === 'restaurants' && (
          <RestaurantsSection restaurants={recommendations?.restaurants} />
        )}
        {activeCategory === 'activities' && (
          <ActivitiesSection activities={recommendations?.activities} />
        )}
        {activeCategory === 'shopping' && (
          <ShoppingSection shopping={recommendations?.shopping} />
        )}
        {activeCategory === 'transportation' && (
          <TransportationSection transportation={recommendations?.transportation} />
        )}
      </div>
    </div>
  );
};

// Restaurants Section
const RestaurantsSection: React.FC<{ 
  restaurants?: GuidebookContent['local_recommendations']['restaurants'] 
}> = ({ restaurants }) => {
  if (!restaurants || restaurants.length === 0) {
    return <EmptyState category="restaurants" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {restaurants.map((restaurant, index) => (
        <div 
          key={index}
          className={cn(
            "bg-card border border-border rounded-2xl p-6",
            "focus:ring-4 focus:ring-primary/50 focus:outline-none",
            "transition-all duration-200"
          )}
          tabIndex={0}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={tvStyles.heading3}>{restaurant.name}</h3>
              <p className={cn(tvStyles.caption, "flex items-center gap-2 mt-1")}>
                <Utensils className="h-5 w-5" />
                {restaurant.type}
              </p>
            </div>
            {restaurant.rating && (
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className={tvStyles.body}>{restaurant.rating}</span>
              </div>
            )}
          </div>
          
          <p className={cn(tvStyles.body, "mb-4")}>{restaurant.description}</p>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className={cn(tvStyles.caption, "flex items-center gap-2")}>
              <MapPin className="h-5 w-5" />
              {restaurant.distance}
            </span>
            {restaurant.phone && (
              <span className={cn(tvStyles.caption, "flex items-center gap-2")}>
                <Phone className="h-5 w-5" />
                {restaurant.phone}
              </span>
            )}
            {restaurant.website && (
              <span className={cn(tvStyles.caption, "flex items-center gap-2")}>
                <Globe className="h-5 w-5" />
                Website
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Activities Section
const ActivitiesSection: React.FC<{ 
  activities?: GuidebookContent['local_recommendations']['activities'] 
}> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return <EmptyState category="activities" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {activities.map((activity, index) => (
        <div 
          key={index}
          className={cn(
            "bg-card border border-border rounded-2xl p-6",
            "focus:ring-4 focus:ring-primary/50 focus:outline-none",
            "transition-all duration-200"
          )}
          tabIndex={0}
        >
          <h3 className={tvStyles.heading3}>{activity.name}</h3>
          <p className={cn(tvStyles.caption, "flex items-center gap-2 mt-1 mb-4")}>
            <Activity className="h-5 w-5" />
            {activity.type}
          </p>
          
          <p className={cn(tvStyles.body, "mb-4")}>{activity.description}</p>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className={cn(tvStyles.caption, "flex items-center gap-2")}>
              <MapPin className="h-5 w-5" />
              {activity.distance}
            </span>
            {activity.hours && (
              <span className={cn(tvStyles.caption, "flex items-center gap-2")}>
                <Clock className="h-5 w-5" />
                {activity.hours}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Shopping Section
const ShoppingSection: React.FC<{ 
  shopping?: GuidebookContent['local_recommendations']['shopping'] 
}> = ({ shopping }) => {
  if (!shopping || shopping.length === 0) {
    return <EmptyState category="shopping" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {shopping.map((shop, index) => (
        <div 
          key={index}
          className={cn(
            "bg-card border border-border rounded-2xl p-6",
            "focus:ring-4 focus:ring-primary/50 focus:outline-none",
            "transition-all duration-200"
          )}
          tabIndex={0}
        >
          <h3 className={tvStyles.heading3}>{shop.name}</h3>
          <p className={cn(tvStyles.caption, "flex items-center gap-2 mt-1 mb-4")}>
            <ShoppingBag className="h-5 w-5" />
            {shop.type}
          </p>
          
          <p className={cn(tvStyles.body, "mb-4")}>{shop.description}</p>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className={cn(tvStyles.caption, "flex items-center gap-2")}>
              <MapPin className="h-5 w-5" />
              {shop.distance}
            </span>
            {shop.hours && (
              <span className={cn(tvStyles.caption, "flex items-center gap-2")}>
                <Clock className="h-5 w-5" />
                {shop.hours}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Transportation Section
const TransportationSection: React.FC<{ 
  transportation?: GuidebookContent['local_recommendations']['transportation'] 
}> = ({ transportation }) => {
  if (!transportation) {
    return <EmptyState category="transportation" />;
  }

  return (
    <div className="space-y-6">
      {transportation.airport && (
        <div className="bg-card border border-border rounded-2xl p-6" tabIndex={0}>
          <h3 className={cn(tvStyles.heading3, "flex items-center gap-3 mb-4")}>
            ✈️ Airport
          </h3>
          <p className={tvStyles.body}>{transportation.airport}</p>
        </div>
      )}
      
      {transportation.parking && (
        <div className="bg-card border border-border rounded-2xl p-6" tabIndex={0}>
          <h3 className={cn(tvStyles.heading3, "flex items-center gap-3 mb-4")}>
            <Car className="h-8 w-8 text-primary" />
            Parking
          </h3>
          <p className={tvStyles.body}>{transportation.parking}</p>
        </div>
      )}
      
      {transportation.public_transit && transportation.public_transit.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6" tabIndex={0}>
          <h3 className={cn(tvStyles.heading3, "flex items-center gap-3 mb-4")}>
            🚌 Public Transit
          </h3>
          <ul className="space-y-2">
            {transportation.public_transit.map((transit, index) => (
              <li key={index} className={tvStyles.body}>• {transit}</li>
            ))}
          </ul>
        </div>
      )}
      
      {transportation.rideshare && transportation.rideshare.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6" tabIndex={0}>
          <h3 className={cn(tvStyles.heading3, "flex items-center gap-3 mb-4")}>
            🚗 Rideshare
          </h3>
          <div className="flex gap-4">
            {transportation.rideshare.map((service, index) => (
              <span 
                key={index} 
                className={cn(
                  tvStyles.body,
                  "bg-muted px-4 py-2 rounded-lg"
                )}
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ category: string }> = ({ category }) => (
  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
    <MapPin className={cn(tvStyles.iconLarge, "mb-4")} />
    <p className={tvStyles.heading3}>No {category} added yet</p>
    <p className={tvStyles.body}>Local recommendations will appear here.</p>
  </div>
);

export default TVLocalGuide;
