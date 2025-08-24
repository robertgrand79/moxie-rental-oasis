-- Add property_id field to testimonials table with foreign key reference
ALTER TABLE public.testimonials 
ADD COLUMN property_id UUID REFERENCES public.properties(id);

-- Create an index for better performance on property lookups
CREATE INDEX idx_testimonials_property_id ON public.testimonials(property_id);