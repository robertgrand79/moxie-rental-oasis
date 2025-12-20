
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Images, ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import PropertyPhotoModal from './PropertyPhotoModal';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface ModernPhotoGalleryProps {
  images: string[];
  featuredPhotos?: string[];
  title: string;
}

const ModernPhotoGallery = ({ images, featuredPhotos, title }: ModernPhotoGalleryProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isMobile = useIsMobile();

  // Use featured photos if available, otherwise use all images
  const displayImages = featuredPhotos && featuredPhotos.length > 0 ? featuredPhotos : images;
  
  if (displayImages.length === 0) return null;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  const openAllPhotosModal = () => {
    setSelectedImageIndex(0);
    setShowModal(true);
  };

  if (isMobile) {
    // Mobile: Horizontal scrolling carousel
    return (
      <>
        <div className="py-8 bg-background">
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {featuredPhotos && featuredPhotos.length > 0 ? 'Featured Photos' : 'Photo Gallery'}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openAllPhotosModal}
                className="flex items-center space-x-1"
              >
                <Images className="h-4 w-4" />
                <span>All ({images.length})</span>
              </Button>
            </div>
          </div>
          
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {displayImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3">
                  <div 
                    className="relative aspect-[4/3] cursor-pointer group overflow-hidden rounded-lg"
                    onClick={() => openModal(index)}
                  >
                    <OptimizedImage
                      src={image}
                      alt={`${title} - Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
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
  }

  // Desktop: Grid layout with masonry effect
  return (
    <>
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {featuredPhotos && featuredPhotos.length > 0 ? 'Featured Photos' : 'Photo Gallery'}
            </h2>
            <p className="text-xl text-muted-foreground">Explore the highlights of this beautiful property</p>
          </div>
          
          {/* Desktop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayImages.map((image, index) => {
              // Vary heights for visual interest
              const heights = ['h-64', 'h-80', 'h-72', 'h-96', 'h-60'];
              const height = heights[index % heights.length];
              
              return (
                <div
                  key={index}
                  className={`cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${height}`}
                  onClick={() => openModal(index)}
                >
                  <OptimizedImage
                    src={image}
                    alt={`${title} - Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <Images className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={openAllPhotosModal}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Images className="h-5 w-5 mr-2" />
              View All Photos ({images.length})
            </Button>
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

export default ModernPhotoGallery;
