
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, MapPin, Bed, Bath, Users, Calendar } from 'lucide-react';
import { Property } from '@/types/property';
import ThumbnailImage from '@/components/ui/thumbnail-image';
import { Link } from 'react-router-dom';
import AirbnbReviewSync from '@/components/admin/AirbnbReviewSync';
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
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-200 relative">
        <ThumbnailImage 
          src={property.image_url} 
          alt={property.title}
          className="w-full h-full"
        />
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

        {property.airbnb_listing_url && (
          <div className="mb-4">
            <AirbnbReviewSync 
              propertyId={property.id}
              airbnbUrl={property.airbnb_listing_url}
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Link to={`/booking/${property.id}`}>
            <Button variant="default" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(property.id)}
          >
            <Edit className="h-4 w-4 mr-2 text-icon-amber" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
