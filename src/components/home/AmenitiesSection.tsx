
import React from 'react';
import { ChefHat, Coffee, Bed, MapPin, Wifi, Car, Tv, Package } from 'lucide-react';

const AmenitiesSection = () => {
  const whatWeOffer = [
    {
      icon: ChefHat,
      title: "Fully Equipped Kitchen",
      description: "Enjoy the convenience of luxury appliances and a fully stocked kitchen with local Oregon touches."
    },
    {
      icon: Coffee,
      title: "Local Welcome Basket",
      description: "Locally roasted Eugene coffee and curated local treats to start your stay right."
    },
    {
      icon: Bed,
      title: "Pacific Northwest Style",
      description: "Homes styled with warmth, character, and modern comfort reflecting Oregon living."
    },
    {
      icon: MapPin,
      title: "Walkable Eugene Areas",
      description: "Located in Eugene's most charming neighborhoods, walkable to local attractions."
    },
    {
      icon: Wifi,
      title: "Free Wi-Fi",
      description: "Stay connected with up to 500 MBPS of free Wi-Fi for work or sharing your Eugene adventures."
    },
    {
      icon: Car,
      title: "Convenient Parking",
      description: "Easy parking options so you can explore Eugene and the Pacific Northwest with ease."
    },
    {
      icon: Tv,
      title: "Smart Entertainment",
      description: "Unwind after exploring Eugene with smart entertainment systems and popular streaming services."
    },
    {
      icon: Package,
      title: "Curated Local Guides",
      description: "Personalized guidebooks featuring our favorite hidden Eugene spots and local recommendations."
    }
  ];

  return (
    <div className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="relative">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-white mb-6">
                Thoughtfully Curated Eugene Amenities
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gradient-accent-from to-gradient-accent-to mx-auto mb-8"></div>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Every detail designed to immerse you in the soul of Eugene
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whatWeOffer.map((offer, index) => {
                const IconComponent = offer.icon;
                return (
                  <div key={index} className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {offer.title}
                    </h3>
                    <p className="text-gray-200 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesSection;
