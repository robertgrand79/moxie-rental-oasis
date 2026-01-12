import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface ImmersiveLightboxProps {
  images: string[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ImmersiveLightbox = ({
  images,
  title,
  isOpen,
  onClose,
  initialIndex = 0
}: ImmersiveLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set([initialIndex]));
  const [isMobile, setIsMobile] = useState(false);
  const [mobileVisibleIndex, setMobileVisibleIndex] = useState(initialIndex);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    startIndex: initialIndex,
    dragFree: false
  });

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync embla with current index
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(initialIndex, true);
      setCurrentIndex(initialIndex);
    }
  }, [emblaApi, initialIndex]);

  // Handle embla scroll events
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setCurrentIndex(index);
      // Preload adjacent images
      setImagesLoaded(prev => {
        const next = new Set(prev);
        next.add(index);
        next.add((index + 1) % images.length);
        next.add((index - 1 + images.length) % images.length);
        return next;
      });
    };

    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          emblaApi?.scrollPrev();
          break;
        case 'ArrowRight':
          emblaApi?.scrollNext();
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, emblaApi]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Trigger entrance animation
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      document.body.style.overflow = '';
      setIsVisible(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const goToPrevious = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const goToNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollToIndex = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  // Scroll thumbnail into view (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const thumbnail = document.getElementById(`lightbox-thumb-${currentIndex}`);
    thumbnail?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentIndex, isMobile]);

  // Scroll to initial image on mobile when opening
  useEffect(() => {
    if (isMobile && isOpen && scrollContainerRef.current && imageRefs.current[initialIndex]) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        imageRefs.current[initialIndex]?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    }
  }, [isMobile, isOpen, initialIndex]);

  // Track visible image on mobile scroll using Intersection Observer
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setMobileVisibleIndex(index);
          }
        });
      },
      { 
        root: scrollContainerRef.current,
        threshold: 0.6 
      }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isMobile, isOpen, images.length]);

  if (!isOpen || !images || images.length === 0) return null;

  // Mobile: Vertical scrolling gallery
  if (isMobile) {
    const mobileContent = (
      <div 
        className={`fixed inset-0 z-[100] bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`Photo gallery for ${title}`}
      >
        {/* Header with close and counter */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <span className="text-white/90 text-sm font-medium">
            {mobileVisibleIndex + 1} of {images.length}
          </span>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 rounded-full text-white/80 hover:text-white active:bg-white/10 transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Vertical scrolling photos */}
        <div 
          ref={scrollContainerRef}
          className="h-[calc(100vh-56px)] overflow-y-auto overscroll-contain"
        >
          {images.map((image, index) => (
            <div
              key={index}
              ref={(el) => (imageRefs.current[index] = el)}
              data-index={index}
              className="flex items-center justify-center min-h-[60vh] py-2 px-1"
            >
              <img
                src={image}
                alt={`${title} - Photo ${index + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                loading={Math.abs(index - initialIndex) <= 2 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
      </div>
    );

    return createPortal(mobileContent, document.body);
  }

  // Desktop: Existing carousel experience

  const lightboxContent = (
    <div 
      className={`fixed inset-0 z-[100] transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo gallery for ${title}`}
    >
      {/* Blurred background - current image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={images[currentIndex]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
        aria-label="Close gallery"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Main carousel */}
      <div className="absolute inset-0 flex items-center justify-center px-16 py-20">
        <div 
          className={`w-full h-full overflow-hidden transition-transform duration-300 ${
            isVisible ? 'scale-100' : 'scale-95'
          }`}
          ref={emblaRef}
        >
          <div className="flex h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-2"
              >
                {(imagesLoaded.has(index) || Math.abs(index - currentIndex) <= 1) && (
                  <img
                    src={image}
                    alt={`${title} - Photo ${index + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    loading={index === currentIndex ? 'eager' : 'lazy'}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image counter */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
        <span className="text-white/70 text-sm font-medium tracking-wide">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
          <div className="flex justify-center">
            <div 
              className="flex gap-2 overflow-x-auto py-2 px-4 max-w-[80vw] scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  id={`lightbox-thumb-${index}`}
                  onClick={() => scrollToIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === currentIndex 
                      ? 'ring-2 ring-white scale-105' 
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : 'false'}
                >
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(lightboxContent, document.body);
};

export default ImmersiveLightbox;
