
import React from 'react';
import PropertyShowcase from '@/components/PropertyShowcase';
import PropertyMap from '@/components/PropertyMap';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { MapPin, Headphones, Calendar } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';

const Listings = () => {
  const { properties } = useProperties();

  const features = [
    {
      icon: MapPin,
      title: "Premium Locations",
      description: "Handpicked properties in Eugene and the most desirable Pacific Northwest vacation destinations.",
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
    <>
      <NavBar />
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Our Vacation Rentals
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover our collection of premium vacation rental properties in Eugene, Oregon and the Pacific Northwest's most desirable destinations.
            </p>
          </div>

          {/* Property Showcase */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mb-16 border border-white/20">
            <PropertyShowcase />
          </div>

          {/* Map Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-16 border border-white/20">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Property Locations</h2>
            </div>
            
            <PropertyMap properties={properties} />
          </div>

          {/* Enhanced Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                    {/* Icon Container */}
                    <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <IconComponent className={`h-8 w-8 ${feature.color} transition-colors duration-300`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Footer />
      </BackgroundWrapper>
    </>
  );
};

export default Listings;
