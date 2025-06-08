
import React from 'react';

const FamilyPhotoSection = () => {
  const photos = [
    {
      src: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=450&fit=crop",
      alt: "Robert and Shelly - Beautiful home interior"
    },
    {
      src: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&h=450&fit=crop", 
      alt: "Robert and Shelly - Oregon outdoor adventure"
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
