import React from 'react';
import { Testimonial } from '@/hooks/useTestimonials';
import TestimonialsGridCard from './TestimonialsGridCard';

interface TestimonialsGridProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
}

const TestimonialsGrid = ({ testimonials, onEdit, onDelete }: TestimonialsGridProps) => {
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      onDelete(id);
    }
  };

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-lg font-medium mb-2">No testimonials found</div>
        <div className="text-sm">Add your first testimonial to get started.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {testimonials.map((testimonial) => (
        <TestimonialsGridCard
          key={testimonial.id}
          testimonial={testimonial}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default TestimonialsGrid;