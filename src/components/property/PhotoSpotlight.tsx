import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Images, Grid3X3 } from 'lucide-react';
import ThumbnailImage from '@/components/ui/thumbnail-image';
import PropertyPhotoModal from './PropertyPhotoModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface PhotoSpotlightProps {
  images: string[];
  featuredPhotos?: string[];
  title: string;
}

const PhotoSpotlight = ({ images, featuredPhotos, title }: PhotoSpotlightProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isMobile = useIsMobile();

  // Use featured photos if available, otherwise use images
  const displayPhotos = featuredPhotos && featuredPhotos.length > 0 
    ? featuredPhotos 
    : images;
  
  if (displayPhotos.length === 0) return null;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  // Get photos for bento grid display
  const mainPhoto = displayPhotos[0];
  const gridPhotos = displayPhotos.slice(1, 5);
  const remainingCount = images.length - 5;

  return (
    <>
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Gallery</h2>
                <p className="text-muted-foreground">
                  {images.length} photos of this beautiful property
                </p>
              </div>
              <Button 
                onClick={() => openModal(0)}
                variant="outline"
                className="hidden md:flex items-center gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                View all {images.length} photos
              </Button>
            </div>
            
            {/* Bento Grid Layout */}
            {isMobile ? (
              /* Mobile: Simple 2-column grid */
              <div className="grid grid-cols-2 gap-2">
                {displayPhotos.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl"
                    onClick={() => openModal(index)}
                  >
                    <ThumbnailImage
                      src={image}
                      alt={`${title} - Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {index === 3 && remainingCount > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          +{remainingCount + 1} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop: Bento grid with large hero */
              <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[500px]">
                {/* Main large image - spans 2 columns and 2 rows */}
                <div
                  className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden rounded-2xl"
                  onClick={() => openModal(0)}
                >
                  <ThumbnailImage
                    src={mainPhoto}
                    alt={`${title} - Main Photo`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Grid of 4 smaller images */}
                {gridPhotos.map((image, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer group overflow-hidden rounded-xl"
                    onClick={() => openModal(index + 1)}
                  >
                    <ThumbnailImage
                      src={image}
                      alt={`${title} - Photo ${index + 2}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    
                    {/* Show "+X more" on the last visible image if there are more */}
                    {index === 3 && remainingCount > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                        <Images className="h-8 w-8 text-white" />
                        <span className="text-white text-lg font-semibold">
                          +{remainingCount} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Mobile: View All Button */}
            <div className="mt-6 text-center md:hidden">
              <Button 
                onClick={() => openModal(0)}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Images className="h-5 w-5 mr-2" />
                View All {images.length} Photos
              </Button>
            </div>
          </div>
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

export default PhotoSpotlight;
