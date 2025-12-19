import React from 'react';
import { Wifi, Car, Coffee, Utensils, Tv, Waves, TreePine, Dumbbell } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useTenant } from '@/contexts/TenantContext';
import { usePublicHomeAmenities } from '@/hooks/useHomeAmenities';

// Default amenities used when no custom ones are configured
const DEFAULT_AMENITIES = [
  { icon: Wifi, name: "High-Speed WiFi", color: "text-blue-500" },
  { icon: Car, name: "Free Parking", color: "text-gray-500" },
  { icon: Coffee, name: "Coffee & Tea", color: "text-amber-500" },
  { icon: Utensils, name: "Full Kitchen", color: "text-emerald-500" },
  { icon: Tv, name: "Smart TV", color: "text-purple-500" },
  { icon: Waves, name: "Hot Tub", color: "text-teal-500" },
  { icon: TreePine, name: "Garden Access", color: "text-green-500" },
  { icon: Dumbbell, name: "Fitness Access", color: "text-orange-500" }
];

const AmenitiesSection = () => {
  const { settings } = useTenantSettings();
  const { tenantId } = useTenant();
  const { amenities: dbAmenities, isLoading } = usePublicHomeAmenities(tenantId);

  // Check if section is enabled (value comes as string from settings)
  const sectionEnabled = String(settings.amenitiesSectionEnabled) !== 'false';
  
  if (!sectionEnabled) {
    return null;
  }

  const sectionTitle = settings.amenitiesSectionTitle || 'Premium Amenities';
  const sectionDescription = settings.amenitiesSectionDescription || 
    'Our properties come thoughtfully equipped with everything you need for a comfortable stay';

  // Helper to get icon component by name
  const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    return icons[iconName] || LucideIcons.Star;
  };

  // Use database amenities if available, otherwise use defaults
  const hasCustomAmenities = dbAmenities.length > 0;
  
  const amenities = hasCustomAmenities 
    ? dbAmenities.map(a => ({
        IconComponent: getIconComponent(a.icon_name),
        name: a.name,
        color: a.color
      }))
    : DEFAULT_AMENITIES.map(a => ({
        IconComponent: a.icon,
        name: a.name,
        color: a.color
      }));

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl shadow-lg p-8 border animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto mb-12"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-xl mx-auto mb-3"></div>
                  <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 border">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {sectionTitle}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {sectionDescription}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {amenities.map((amenity, index) => {
              const IconComponent = amenity.IconComponent;
              return (
                <div key={index} className="group text-center">
                  <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-300 border group-hover:shadow-md group-hover:bg-muted">
                    <IconComponent className={`h-6 w-6 ${amenity.color} transition-colors duration-300`} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {amenity.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
