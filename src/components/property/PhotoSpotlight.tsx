
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Images } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
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

  // Use featured photos if available, otherwise use first 10 images
  const spotlightPhotos = featuredPhotos && featuredPhotos.length > 0 
    ? featuredPhotos.slice(0, 10) 
    : images.slice(0, 10);
  
  if (spotlightPhotos.length === 0) return null;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  const openAllPhotosModal = () => {
    setSelectedImageIndex(0);
    setShowModal(true);
  };

  return (
    <>
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Property Highlights</h2>
              <p className="text-gray-600">Explore the beautiful spaces of this property</p>
            </div>
            
            {/* Photo Thumbnails Grid */}
            <div className={`grid gap-3 mb-8 ${
              isMobile 
                ? 'grid-cols-3' 
                : 'grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'
            }`}>
              {spotlightPhotos.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={() => openModal(index)}
                >
                  <OptimizedImage
                    src={image}
                    alt={`${title} - Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              ))}
            </div>
            
            {/* Centered View All Button */}
            <div className="text-center">
              <Button 
                onClick={openAllPhotosModal}
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 px-8 py-3"
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
