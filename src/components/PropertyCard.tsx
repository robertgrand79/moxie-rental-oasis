import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, MapPin, Bed, Bath, Users, Calendar } from 'lucide-react';
import { Property } from '@/types/property';
import ThumbnailImage from '@/components/ui/thumbnail-image';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PropertyCardProps {
  property: Property;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PropertyCard = ({ property, onEdit, onDelete }: PropertyCardProps) => {
  // Get the best available image URL
  const imageUrl = property.cover_image_url || property.image_url ||
    (property.images && Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : null) ||
    (property.featured_photos && Array.isArray(property.featured_photos) && property.featured_photos.length > 0 ? property.featured_photos[0] : null);

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-200 relative">
        {imageUrl ? (
          <ThumbnailImage
            src={imageUrl}
            alt={property.title}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-sm">No image</div>
            </div>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{property.title}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          <MapPin className="h-3 w-3 mr-1 text-icon-blue" />
          {property.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{property.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1 text-icon-purple" />
            {property.bedrooms} bed
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1 text-icon-teal" />
            {property.bathrooms} bath
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-icon-emerald" />
            {property.max_guests} guests
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Link to={`/booking/${property.id}`} className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full sm:w-auto min-h-[44px]">
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(property.id)}
            className="min-h-[44px]"
          >
            <Edit className="h-4 w-4 mr-2 text-icon-amber" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 min-h-[44px]"
              >
                <Trash2 className="h-4 w-4 mr-2 text-icon-rose" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Property</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{property.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(property.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Property
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
