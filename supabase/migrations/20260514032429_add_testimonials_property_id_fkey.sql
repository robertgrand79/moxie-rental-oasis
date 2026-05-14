-- Add the missing FK on testimonials.property_id -> properties.id.
-- Without this, PostgREST cannot resolve the `properties!inner(...)` embed
-- used by the homepage testimonials query and returns 400
-- ("Could not find a relationship between 'testimonials' and 'properties'").

ALTER TABLE public.testimonials
  ADD CONSTRAINT testimonials_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.properties(id)
  ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
