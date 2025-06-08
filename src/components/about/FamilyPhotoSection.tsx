
import React from 'react';

const FamilyPhotoSection = () => {
  const photos = [
    {
      src: "/lovable-uploads/a5d1cce3-c3fc-40a0-9eed-f641995e8887.png",
      alt: "Robert and Shelly - First photo"
    },
    {
      src: "/lovable-uploads/b78c89b5-51f8-409b-a09a-b8dd9c939591.png", 
      alt: "Robert and Shelly - Second photo"
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
