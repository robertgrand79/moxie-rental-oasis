
import React from 'react';
import OptimizedImage from '@/components/ui/optimized-image';

const FamilyPhotoSection = () => {
  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
        <OptimizedImage
          src="/lovable-uploads/bd92da84-2272-4ac5-aa53-6b9afc089fa2.png"
          alt="Robert and Shelly - The Moxie Family Photo Collage"
          width={800}
          height={600}
          className="rounded-2xl w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        {/* Subtle overlay for enhanced visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to rounded-full opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
    </div>
  );
};

export default FamilyPhotoSection;
