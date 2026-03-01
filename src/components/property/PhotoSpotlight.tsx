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

  // Use featured photos if available, otherwise use images — show up to 10
  const displayPhotos = featuredPhotos && featuredPhotos.length > 0 
    ? featuredPhotos.slice(0, 10)
    : images.slice(0, 10);
  
  if (displayPhotos.length === 0) return null;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

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
            
            {isMobile ? (
              /* Mobile: 2-column grid showing all featured */
              <div className="grid grid-cols-2 gap-2">
                {displayPhotos.map((image, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer group overflow-hidden rounded-xl ${
                      index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'
                    }`}
                    onClick={() => openModal(index)}
                  >
                    <ThumbnailImage
                      src={image}
                      alt={`${title} - Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop: Masonry-style grid for all photos */
              <div className="grid grid-cols-3 gap-3 auto-rows-[200px]">
                {displayPhotos.map((image, index) => {
                  // First image spans 2 cols + 2 rows, every 4th spans 2 cols
                  const isHero = index === 0;
                  const isWide = index === 3 || index === 7;
                  
                  return (
                    <div
                      key={index}
                      className={`relative cursor-pointer group overflow-hidden rounded-2xl ${
                        isHero ? 'col-span-2 row-span-2' : isWide ? 'col-span-2' : ''
                      }`}
                      onClick={() => openModal(index)}
                    >
                      <ThumbnailImage
                        src={image}
                        alt={`${title} - Photo ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Mobile: View All Button */}
            {images.length > displayPhotos.length && (
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
            )}
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
