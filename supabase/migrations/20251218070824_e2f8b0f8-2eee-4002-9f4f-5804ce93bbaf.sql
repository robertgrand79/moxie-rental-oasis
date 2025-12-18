-- Make created_by nullable for system-imported testimonials (e.g., Airbnb reviews)
ALTER TABLE public.testimonials 
ALTER COLUMN created_by DROP NOT NULL;