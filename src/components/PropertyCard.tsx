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
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-200">
      <div className="aspect-video relative overflow-hidden">
        <ThumbnailImage 
          src={property.image_url} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <CardHeader className="p-6 pb-3">
        <CardTitle className="text-lg font-medium tracking-tight">{property.title}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" strokeWidth={1.5} />
          {property.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <p className="text-sm text-muted-foreground mb-5 line-clamp-2">{property.description}</p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" strokeWidth={1.5} />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" strokeWidth={1.5} />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span>{property.max_guests} guests</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t border-border/30">
          <Link to={`/booking/${property.id}`} className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full sm:w-auto min-h-[44px]">
              <Calendar className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Book Now
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(property.id)}
            className="min-h-[44px]"
          >
            <Edit className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/5 min-h-[44px]"
              >
                <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
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
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
