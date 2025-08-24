import React from 'react';
import { Edit, Trash2, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Testimonial } from '@/hooks/useTestimonials';

interface TestimonialsGridCardProps {
  testimonial: Testimonial;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
}

const TestimonialsGridCard = ({ testimonial, onEdit, onDelete }: TestimonialsGridCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={testimonial.guest_avatar_url} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(testimonial.guest_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{testimonial.guest_name}</h3>
            {testimonial.guest_location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{testimonial.guest_location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {renderStars(testimonial.rating)}
            <span className="text-sm text-muted-foreground ml-1">
              {testimonial.rating}/5
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {testimonial.is_featured && (
              <Badge variant="default" className="text-xs">
                Featured
              </Badge>
            )}
            {!testimonial.is_active && (
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {testimonial.property_name && (
          <Badge variant="outline" className="mb-3 text-xs">
            {testimonial.property_name}
          </Badge>
        )}
        {testimonial.content && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {testimonial.content}
          </p>
        )}
        {testimonial.stay_date && (
          <div className="mt-2 text-xs text-muted-foreground">
            Stay: {new Date(testimonial.stay_date).toLocaleDateString()}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(testimonial)}
          className="h-8 px-3"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(testimonial.id)}
          className="h-8 px-3 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestimonialsGridCard;