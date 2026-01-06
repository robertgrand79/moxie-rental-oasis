-- Insert 8 lifestyle gallery images for staymoxie-template-single
INSERT INTO public.lifestyle_gallery (id, title, description, image_url, category, activity_type, display_order, is_featured, is_active, status, organization_id)
VALUES
  ('30000000-0000-0000-0001-000000000001', 'Mountain Sunrise', 'Watch the sun paint the peaks in golden light from your cabin deck', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 'experience', 'photography', 1, true, true, 'published', 'b0000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000002', 'Morning Coffee with a View', 'Start your day with fresh coffee and breathtaking mountain vistas', 'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=1200', 'lifestyle', 'relaxation', 2, true, true, 'published', 'b0000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000003', 'Trail Adventures', 'Explore miles of scenic hiking trails just steps from the cabin', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200', 'experience', 'hiking', 3, false, true, 'published', 'b0000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000004', 'Cozy Fireside Evenings', 'Gather around the crackling fireplace after a day of adventure', 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200', 'lifestyle', 'relaxation', 4, true, true, 'published', 'b0000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000005', 'Stargazing from the Hot Tub', 'Soak under a canopy of stars in the private outdoor hot tub', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200', 'experience', 'relaxation', 5, true, true, 'published', 'b0000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000006', 'Family Bonfire Nights', 'Create lasting memories around the outdoor fire pit', 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=1200', 'lifestyle', 'family', 6, false, true, 'published', 'b0000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000007', 'Winter Wonderland', 'Experience the magic of a snow-covered mountain retreat', 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1200', 'experience', 'seasonal', 7, false, true, 'published', 'b0000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000008', 'Autumn Splendor', 'Witness nature''s colorful display as leaves transform the landscape', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', 'experience', 'seasonal', 8, false, true, 'published', 'b0000000-0000-0000-0000-000000000001');

-- Insert 3 checklist templates for staymoxie-template-single (using 'custom' type which is allowed)
INSERT INTO public.maintenance_checklist_templates (id, name, type, description, is_system_template, organization_id, created_by)
VALUES
  ('40000000-0000-0000-0001-000000000001', 'Guest Turnover Checklist', 'custom', 'Complete cleaning checklist between guest stays', false, 'b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000'),
  ('40000000-0000-0000-0001-000000000002', 'Pre-Season Maintenance', 'custom', 'Seasonal maintenance tasks to keep the property in top condition', false, 'b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000'),
  ('40000000-0000-0000-0001-000000000003', 'Guest Welcome Prep', 'custom', 'Prepare the cabin for guest arrival', false, 'b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000');

-- Insert items for Guest Turnover Checklist
INSERT INTO public.maintenance_checklist_items (template_id, category, title, display_order, organization_id)
VALUES
  ('40000000-0000-0000-0001-000000000001', 'Linens', 'Strip beds', 1, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Linens', 'Start laundry', 2, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Cleaning', 'Clean bathrooms', 3, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Cleaning', 'Clean kitchen', 4, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Cleaning', 'Vacuum all floors', 5, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Cleaning', 'Mop hard floors', 6, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Supplies', 'Restock supplies', 7, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Linens', 'Make beds with fresh linens', 8, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Final Checks', 'Check all lights working', 9, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Final Checks', 'Set thermostat', 10, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000001', 'Final Checks', 'Final walkthrough', 11, 'b0000000-0000-0000-0000-000000000001');

-- Insert items for Pre-Season Maintenance
INSERT INTO public.maintenance_checklist_items (template_id, category, title, display_order, organization_id)
VALUES
  ('40000000-0000-0000-0001-000000000002', 'HVAC', 'HVAC service', 1, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000002', 'Safety', 'Check smoke detectors', 2, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000002', 'Exterior', 'Inspect roof', 3, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000002', 'Exterior', 'Clean gutters', 4, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000002', 'Amenities', 'Service hot tub', 5, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000002', 'Exterior', 'Check deck for repairs', 6, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000002', 'Interior', 'Test all appliances', 7, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000002', 'Safety', 'Update emergency supplies', 8, 'b0000000-0000-0000-0000-000000000001');

-- Insert items for Guest Welcome Prep
INSERT INTO public.maintenance_checklist_items (template_id, category, title, display_order, organization_id)
VALUES
  ('40000000-0000-0000-0001-000000000003', 'Welcome', 'Set welcome gift', 1, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000003', 'Welcome', 'Print guest book entry', 2, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000003', 'Technology', 'Check WiFi working', 3, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000003', 'Supplies', 'Stock coffee and tea', 4, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000003', 'Linens', 'Put out fresh towels', 5, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000003', 'Ambiance', 'Set lighting scene', 6, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000003', 'Climate', 'Adjust thermostat for arrival', 7, 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0001-000000000003', 'Security', 'Enable smart lock code', 8, 'b0000000-0000-0000-0000-000000000001');