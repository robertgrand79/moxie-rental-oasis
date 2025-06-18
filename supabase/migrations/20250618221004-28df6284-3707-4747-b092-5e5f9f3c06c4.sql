
-- Add display_order field to properties table
ALTER TABLE public.properties 
ADD COLUMN display_order integer DEFAULT 0;

-- Update existing properties with the desired display order
-- Moxie Harris Bungalow: display_order = 1
UPDATE public.properties 
SET display_order = 1 
WHERE title ILIKE '%Harris Bungalow%';

-- Moxie Kincaid House: display_order = 2
UPDATE public.properties 
SET display_order = 2 
WHERE title ILIKE '%Kincaid House%';

-- Moxie 10th St House: display_order = 3
UPDATE public.properties 
SET display_order = 3 
WHERE title ILIKE '%10th St House%' AND title NOT ILIKE '%Studio%';

-- Moxie 10th St. Studio: display_order = 4
UPDATE public.properties 
SET display_order = 4 
WHERE title ILIKE '%10th St%' AND title ILIKE '%Studio%';

-- Moxie Tree House: display_order = 5
UPDATE public.properties 
SET display_order = 5 
WHERE title ILIKE '%Tree House%';
