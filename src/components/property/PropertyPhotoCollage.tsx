
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Images } from 'lucide-react';
import PropertyPhotoModal from './PropertyPhotoModal';

interface PropertyPhotoCollageProps {
  images: string[];
  title: string;
}

const PropertyPhotoCollage = ({ images, title }: PropertyPhotoCollageProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video lg:aspect-[2/1] relative bg-muted flex items-center justify-center">
        <div className="text-center">
          <Images className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No photos available</p>
        </div>
      </div>
    );
  }

  const displayImages = images.slice(0, 6);
  const hasMoreImages = images.length > 6;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  return (
    <>
      <div className="aspect-video lg:aspect-[2/1] relative">
        {displayImages.length === 1 ? (
          // Single image layout
          <div className="w-full h-full relative group cursor-pointer" onClick={() => openModal(0)}>
            <img 
              src={displayImages[0]} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ) : (
          // Grid layout for multiple images
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
            {/* Main large image */}
            <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => openModal(0)}>
              <img 
                src={displayImages[0]} 
                alt={title}
                className="w-full h-full object-cover rounded-l-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-l-lg" />
            </div>
            
            {/* Smaller images */}
            {displayImages.slice(1, 5).map((image, index) => (
              <div 
                key={index + 1} 
                className="relative group cursor-pointer"
                onClick={() => openModal(index + 1)}
              >
                <img 
                  src={image} 
                  alt={`${title} - Photo ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            ))}
            
            {/* Last image with overlay if more images exist */}
            {displayImages.length > 5 && (
              <div 
                className="relative group cursor-pointer"
                onClick={() => openModal(5)}
              >
                <img 
                  src={displayImages[5]} 
                  alt={`${title} - Photo 6`}
                  className="w-full h-full object-cover rounded-r-lg transition-transform duration-300 group-hover:scale-105"
                />
                {hasMoreImages && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-r-lg">
                    <span className="text-white font-semibold text-lg">
                      +{images.length - 6} more
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-r-lg" />
              </div>
            )}
          </div>
        )}
        
        {/* View All Photos button overlay */}
        <div className="absolute bottom-4 right-4">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowModal(true)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <Images className="h-4 w-4 mr-2" />
            View All Photos ({images.length})
          </Button>
        </div>
      </div>

      <PropertyPhotoModal
        images={images}
        title={title}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialIndex={selectedImageIndex}
      />
    </>
  );
};

export default PropertyPhotoCollage;
