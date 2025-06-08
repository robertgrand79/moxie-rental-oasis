
import React from 'react';
import OptimizedImage from '@/components/ui/optimized-image';

const FamilyPhotoSection = () => {
  const photos = [
    {
      src: "/lovable-uploads/0bec03c1-4efb-4e69-aee6-e7cad60ea374.png",
      alt: "Robert and Shelly - Wedding ceremony moment",
      context: "Wedding Day",
      gridClass: "col-span-2 row-span-2"
    },
    {
      src: "/lovable-uploads/21121584-267d-4a0c-8d9d-785d1b0d2ec2.png", 
      alt: "Robert and Shelly - Stadium selfie",
      context: "Local Adventures",
      gridClass: "col-span-1 row-span-1"
    },
    {
      src: "/lovable-uploads/57d73fd0-c9a0-4d79-bcef-e15c498e795c.png",
      alt: "Robert and Shelly - Beach sunset workout",
      context: "Active Lifestyle",
      gridClass: "col-span-1 row-span-1"
    },
    {
      src: "/lovable-uploads/697e2c26-983b-4e24-b9fa-f6e1dea503e2.png",
      alt: "Robert and Shelly - Tropical wedding celebration",
      context: "Celebration",
      gridClass: "col-span-1 row-span-2"
    },
    {
      src: "/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png",
      alt: "Robert and Shelly - Temple wedding photo",
      context: "Sacred Moments",
      gridClass: "col-span-1 row-span-1"
    },
    {
      src: "/lovable-uploads/8d88b689-dbb7-492d-bce6-e3486c88b504.png",
      alt: "Robert and Shelly - Mountain lake adventure",
      context: "Oregon Adventures",
      gridClass: "col-span-1 row-span-1"
    }
  ];

  return (
    <div className="relative">
      {/* Modern Photo Grid */}
      <div className="grid grid-cols-3 grid-rows-3 gap-4 h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
        {photos.map((photo, index) => (
          <div 
            key={index}
            className={`${photo.gridClass} relative group overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`}
          >
            <OptimizedImage
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              priority={index < 3}
            />
            
            {/* Hover Overlay with Context */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
              <div className="p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-sm font-medium tracking-wide">{photo.context}</span>
              </div>
            </div>

            {/* Subtle border highlight */}
            <div className="absolute inset-0 border-2 border-white/20 group-hover:border-white/40 transition-colors duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to rounded-full opacity-15 group-hover:opacity-25 transition-opacity duration-300 blur-sm"></div>
      
      {/* Floating accent elements */}
      <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse"></div>
      <div className="absolute top-1/4 -right-2 w-4 h-4 bg-gradient-to-r from-gradient-accent-from to-gradient-accent-to rounded-full animate-pulse delay-1000"></div>
    </div>
  );
};

export default FamilyPhotoSection;
