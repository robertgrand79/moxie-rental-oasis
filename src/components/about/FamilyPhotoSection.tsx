
import React from 'react';

const FamilyPhotoSection = () => {
  const photos = [
    {
      src: "/lovable-uploads/725febeb-79c2-4ff5-8f7c-0ece524525d3.png",
      alt: "Robert and Shelly - Stadium selfie in Oregon gear"
    },
    {
      src: "/lovable-uploads/510f0a04-795e-42ee-8c32-07334045c2f0.png", 
      alt: "Robert and Shelly - Tropical wedding celebration"
    }
  ];

  return (
    <div className="w-full">
      <div className="space-y-6">
        {photos.map((photo, index) => (
          <div 
            key={index}
            className="aspect-[4/3] relative overflow-hidden bg-gray-100 rounded-lg"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyPhotoSection;
