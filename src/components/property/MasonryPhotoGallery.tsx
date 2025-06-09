
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Images, ZoomIn } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import PropertyPhotoModal from './PropertyPhotoModal';

interface MasonryPhotoGalleryProps {
  images: string[];
  featuredPhotos?: string[];
  title: string;
}

const MasonryPhotoGallery = ({ images, featuredPhotos, title }: MasonryPhotoGalleryProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Use featured photos if available, otherwise use all images
  const displayImages = featuredPhotos && featuredPhotos.length > 0 ? featuredPhotos : images;
  
  if (!displayImages || displayImages.length <= 1) return null;

  // Skip the first image since it's used as hero
  const galleryImages = displayImages.slice(1);

  const openModal = (index: number) => {
    setSelectedImageIndex(index + 1); // +1 because we skipped the first image
    setShowModal(true);
  };

  return (
    <>
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Photo Gallery</h2>
            <p className="text-xl text-muted-foreground">Explore every corner of this beautiful property</p>
          </div>
          
          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {galleryImages.map((image, index) => {
              // Vary heights for masonry effect
              const heights = ['h-64', 'h-80', 'h-72', 'h-96', 'h-60'];
              const height = heights[index % heights.length];
              
              return (
                <div
                  key={index}
                  className={`break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${height}`}
                  onClick={() => openModal(index)}
                >
                  <OptimizedImage
                    src={image}
                    alt={`${title} - Photo ${index + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* View All Button */}
          <div className="text-center mt-12">
            <Button 
              onClick={() => setShowModal(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Images className="h-5 w-5 mr-2" />
              View All Photos ({displayImages.length})
            </Button>
          </div>
        </div>
      </div>

      <PropertyPhotoModal
        images={displayImages}
        title={title}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialIndex={selectedImageIndex}
      />
    </>
  );
};

export default MasonryPhotoGallery;
