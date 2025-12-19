import React from 'react';
import { MoreVertical, Edit, Trash2, Star, MapPin, Eye, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Testimonial } from '@/hooks/useTestimonials';

interface TestimonialsListProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void | Promise<void>;
  onView: (testimonial: Testimonial) => void;
  onToggleActive?: (testimonial: Testimonial) => void;
}

const TestimonialsList = ({ testimonials, onEdit, onDelete, onView, onToggleActive }: TestimonialsListProps) => {
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      onDelete(id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlatformBadgeStyle = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'airbnb':
        return 'bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/20';
      case 'vrbo':
        return 'bg-[#3662D8]/10 text-[#3662D8] border-[#3662D8]/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews found. Add your first review to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {testimonials.map((testimonial) => {
        const isActive = testimonial.is_active !== false;
        
        return (
          <div
            key={testimonial.id}
            className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow cursor-pointer group"
            onClick={() => onView(testimonial)}
          >
            {/* Status indicator */}
            <div className={`w-1 h-14 rounded-full flex-shrink-0 ${
              isActive ? 'bg-emerald-500' : 'bg-muted'
            }`} />

            {/* Avatar */}
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={testimonial.guest_avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(testimonial.guest_name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {testimonial.guest_name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={isActive 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
                    : 'bg-muted text-muted-foreground'
                  }
                >
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
                {testimonial.is_featured && (
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {testimonial.booking_platform && (
                  <Badge variant="outline" className={getPlatformBadgeStyle(testimonial.booking_platform)}>
                    {testimonial.booking_platform.charAt(0).toUpperCase() + testimonial.booking_platform.slice(1)}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {testimonial.guest_location && (
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span className="truncate max-w-[150px]">{testimonial.guest_location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < testimonial.rating 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                  <span className="ml-1">{testimonial.rating}/5</span>
                </div>

                {testimonial.property_name && (
                  <Badge variant="outline" className="text-xs">
                    {testimonial.property_name}
                  </Badge>
                )}

                {testimonial.stay_date && (
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {new Date(testimonial.stay_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-1">
                {testimonial.review_text || testimonial.content || 'No review text'}
              </p>
            </div>
            
            {/* Actions */}
            <div 
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(testimonial)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(testimonial)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {onToggleActive && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleActive(testimonial)}>
                        {isActive ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TestimonialsList;
