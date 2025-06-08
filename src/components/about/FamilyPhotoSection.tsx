
import React from 'react';

const FamilyPhotoSection = () => {
  const photos = [
    {
      src: "/lovable-uploads/40b098d7-e61c-45a4-af8f-e770ace50ec3.png",
      alt: "Robert and Shelly - First photo"
    },
    {
      src: "/lovable-uploads/bd92da84-2272-4ac5-aa53-6b9afc089fa2.png", 
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
