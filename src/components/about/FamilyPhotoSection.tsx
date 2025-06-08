
import React from 'react';
import OptimizedImage from '@/components/ui/optimized-image';

const FamilyPhotoSection = () => {
  const photos = [
    {
      src: "/lovable-uploads/0bec03c1-4efb-4e69-aee6-e7cad60ea374.png",
      alt: "Robert and Shelly - Wedding ceremony moment"
    },
    {
      src: "/lovable-uploads/21121584-267d-4a0c-8d9d-785d1b0d2ec2.png", 
      alt: "Robert and Shelly - Stadium selfie"
    },
    {
      src: "/lovable-uploads/57d73fd0-c9a0-4d79-bcef-e15c498e795c.png",
      alt: "Robert and Shelly - Beach sunset workout"
    },
    {
      src: "/lovable-uploads/697e2c26-983b-4e24-b9fa-f6e1dea503e2.png",
      alt: "Robert and Shelly - Tropical wedding celebration"
    },
    {
      src: "/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png",
      alt: "Robert and Shelly - Temple wedding photo"
    },
    {
      src: "/lovable-uploads/8d88b689-dbb7-492d-bce6-e3486c88b504.png",
      alt: "Robert and Shelly - Mountain lake adventure"
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-xl overflow-hidden">
        {photos.map((photo, index) => (
          <div 
            key={index}
            className="aspect-square relative overflow-hidden bg-gray-100 rounded-lg group"
          >
            <OptimizedImage
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              priority={index < 3}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyPhotoSection;
