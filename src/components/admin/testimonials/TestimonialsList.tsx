
import React from 'react';
import { Testimonial } from '@/hooks/useTestimonials';
import TestimonialCard from './TestimonialCard';

interface TestimonialsListProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => Promise<void>;
}

const TestimonialsList = ({ testimonials, onEdit, onDelete }: TestimonialsListProps) => {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      await onDelete(id);
    }
  };

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No testimonials found. Add your first testimonial to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default TestimonialsList;
