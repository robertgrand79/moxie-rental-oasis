
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2, User } from 'lucide-react';
import { Testimonial } from '@/hooks/useTestimonials';
import OptimizedImage from '@/components/ui/optimized-image';

interface TestimonialCardProps {
  testimonial: Testimonial;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
}

const TestimonialCard = ({ testimonial, onEdit, onDelete }: TestimonialCardProps) => {
  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg">
      <div className="flex-shrink-0">
        {testimonial.guest_avatar_url ? (
          <OptimizedImage
            src={testimonial.guest_avatar_url}
            alt={testimonial.guest_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-medium text-gray-900">{testimonial.guest_name}</h4>
            <p className="text-sm text-gray-500">{testimonial.guest_location}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center space-x-1">
              {testimonial.is_featured && <Badge variant="secondary">Featured</Badge>}
              {!testimonial.is_active && <Badge variant="outline">Inactive</Badge>}
            </div>
          </div>
        </div>
        <p className="text-gray-700 mb-2 line-clamp-2">{testimonial.review_text}</p>
        {testimonial.property_name && (
          <p className="text-sm text-blue-600 mb-2">Property: {testimonial.property_name}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Order: {testimonial.display_order}</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(testimonial)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(testimonial.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
