
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Star, Eye } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';

interface FeaturedPhotoSelectionProps {
  allImages: string[];
  featuredPhotos: string[];
  onFeaturedPhotosChange: (photos: string[]) => void;
  disabled?: boolean;
}

const FeaturedPhotoSelection = ({
  allImages,
  featuredPhotos,
  onFeaturedPhotosChange,
  disabled = false
}: FeaturedPhotoSelectionProps) => {
  const toggleFeaturedPhoto = (imageUrl: string) => {
    if (disabled) return;
    
    if (featuredPhotos.includes(imageUrl)) {
      // Remove from featured
      onFeaturedPhotosChange(featuredPhotos.filter(url => url !== imageUrl));
    } else if (featuredPhotos.length < 10) {
      // Add to featured (max 10)
      onFeaturedPhotosChange([...featuredPhotos, imageUrl]);
    }
  };

  if (allImages.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Featured Photos for Property Page
        </FormLabel>
        <Badge variant="secondary">
          {featuredPhotos.length}/10 selected
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Select up to 10 photos to display on the property page. These will be shown in the photo gallery section.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {allImages.map((imageUrl, index) => {
          const isFeatured = featuredPhotos.includes(imageUrl);
          const featuredIndex = featuredPhotos.indexOf(imageUrl);
          
          return (
            <div
              key={index}
              className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${
                isFeatured 
                  ? 'border-yellow-400 ring-2 ring-yellow-400/20' 
                  : 'border-border hover:border-primary'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => toggleFeaturedPhoto(imageUrl)}
            >
              <OptimizedImage
                src={imageUrl}
                alt={`Property image ${index + 1}`}
                width={150}
                height={150}
                className="w-full h-24 object-cover"
              />
              
              {/* Featured indicator */}
              {isFeatured && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {featuredIndex + 1}
                </div>
              )}
              
              {/* Hover overlay */}
              <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center ${disabled ? 'group-hover:bg-black/0' : ''}`}>
                <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              
              {/* Selection overlay */}
              {isFeatured && (
                <div className="absolute inset-0 bg-yellow-400/10 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
      
      {featuredPhotos.length === 10 && (
        <p className="text-sm text-amber-600">
          Maximum of 10 featured photos selected. Unselect a photo to choose a different one.
        </p>
      )}
    </div>
  );
};

export default FeaturedPhotoSelection;
