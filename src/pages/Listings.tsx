
import React from 'react';
import PropertyShowcase from '@/components/PropertyShowcase';
import PropertyMap from '@/components/PropertyMap';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import { MapPin, Headphones, Calendar } from 'lucide-react';
import { useTenantProperties } from '@/hooks/useTenantProperties';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const Listings = () => {
  const { properties } = useTenantProperties();
  const { settings } = useTenantSettings();
  
  const locationText = settings.heroLocationText || 'your destination';

  const features = [
    {
      icon: MapPin,
      title: "Premium Locations",
      description: `Handpicked properties in ${locationText} and the most desirable vacation destinations.`,
      color: "text-icon-emerald"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Our dedicated team is here to help you every step of the way with exceptional service.",
      color: "text-icon-blue"
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Simple and secure booking process with instant confirmation and seamless experience.",
      color: "text-icon-purple"
    }
  ];

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Our Vacation Rentals
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our collection of premium vacation rental properties in {locationText}.
          </p>
        </div>

        {/* Property Showcase */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mb-16 border border-border/20">
          <PropertyShowcase />
        </div>

        {/* Map Section */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-16 border border-border/20">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Property Locations</h2>
          </div>
          
          <PropertyMap properties={properties} />
        </div>

        {/* Enhanced Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group h-full">
                <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-border/20 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 h-full">
                  {/* Icon Container */}
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className={`h-8 w-8 ${feature.color} transition-colors duration-300`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Listings;
