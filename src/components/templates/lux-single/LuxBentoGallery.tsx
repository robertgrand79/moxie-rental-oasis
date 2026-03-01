import React, { useState } from 'react';
import OptimizedImage from '@/components/ui/optimized-image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LuxBentoGalleryProps {
  images: string[];
  title: string;
}

const LuxBentoGallery: React.FC<LuxBentoGalleryProps> = ({ images, title }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  // Take up to 5 photos for the bento layout
  const bentoImages = images.slice(0, 5);
  const feature = bentoImages[0];
  const grid = bentoImages.slice(1, 5);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigate = (direction: 1 | -1) => {
    if (lightboxIndex === null) return;
    const next = (lightboxIndex + direction + images.length) % images.length;
    setLightboxIndex(next);
  };

  return (
    <>
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <p className="uppercase tracking-widest text-sm text-muted-foreground mb-12">
            Gallery
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {/* Feature image — left */}
            <div
              className="relative aspect-[3/4] lg:aspect-auto lg:row-span-2 overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => openLightbox(0)}
            >
              <OptimizedImage
                src={feature}
                alt={`${title} - Featured`}
                className="w-full h-full"
                width={800}
                quality={50}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* 2x2 grid — right */}
            {grid.length > 0 && (
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {grid.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => openLightbox(i + 1)}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${title} - ${i + 2}`}
                      className="w-full h-full"
                      width={400}
                      quality={50}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                    {/* Show remaining count on last tile */}
                    {i === grid.length - 1 && images.length > 5 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-serif text-2xl">
                          +{images.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0 overflow-hidden">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {lightboxIndex !== null && (
              <img
                src={images[lightboxIndex]}
                alt={`${title} - ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Navigation */}
            <button
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2"
              aria-label="Previous"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2"
              aria-label="Next"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm tracking-widest uppercase">
              {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LuxBentoGallery;
