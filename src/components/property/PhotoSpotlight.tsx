
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Images } from 'lucide-react';
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
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Property Highlights</h2>
              <p className="text-xl text-gray-600">Explore the beautiful spaces of this property</p>
            </div>
            
            {/* Enhanced Photo Thumbnails Grid - Larger and more responsive */}
            <div className={`grid gap-4 mb-12 ${
              isMobile 
                ? 'grid-cols-2' 
                : 'grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10'
            }`}>
              {spotlightPhotos.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => openModal(index)}
                >
                  <ThumbnailImage
                    src={image}
                    alt={`${title} - Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Images className="h-5 w-5 text-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enhanced View All Button */}
            <div className="text-center">
              <Button 
                onClick={openAllPhotosModal}
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-primary text-gray-700 hover:text-primary px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Images className="h-6 w-6 mr-3" />
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
