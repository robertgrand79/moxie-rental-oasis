
import React from 'react';
import OptimizedImage from '@/components/ui/optimized-image';

const FamilyPhotoSection = () => {
  return (
    <div className="relative">
      <OptimizedImage
        src="/lovable-uploads/bd92da84-2272-4ac5-aa53-6b9afc089fa2.png"
        alt="Robert and Shelly - The Moxie Family Photo Collage"
        width={800}
        height={600}
        className="rounded-2xl shadow-lg w-full h-auto object-contain"
        priority={false}
      />
    </div>
  );
};

export default FamilyPhotoSection;
