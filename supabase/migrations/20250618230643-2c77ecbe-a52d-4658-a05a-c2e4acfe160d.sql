
-- Create enhanced image storage and analytics tables
CREATE TABLE IF NOT EXISTS public.image_transformations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  transformation_params JSONB NOT NULL,
  optimized_url TEXT NOT NULL,
  file_size_original INTEGER,
  file_size_optimized INTEGER,
  compression_ratio DECIMAL(5,2),
  format_original TEXT,
  format_optimized TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Create image performance analytics table
CREATE TABLE IF NOT EXISTS public.image_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  page_url TEXT,
  load_time_ms INTEGER,
  bandwidth_saved_bytes INTEGER,
  user_agent TEXT,
  connection_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create image optimization settings table
CREATE TABLE IF NOT EXISTS public.image_optimization_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default optimization settings
INSERT INTO public.image_optimization_settings (setting_key, setting_value) VALUES
('quality_settings', '{"webp": 85, "jpeg": 80, "png": 95}'),
('size_breakpoints', '{"thumbnail": 300, "medium": 768, "large": 1200, "xlarge": 1920}'),
('format_preferences', '["webp", "avif", "jpeg", "png"]'),
('performance_budget', '{"max_image_size_kb": 500, "max_total_page_size_mb": 5}')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_transformations_original_url ON public.image_transformations(original_url);
CREATE INDEX IF NOT EXISTS idx_image_transformations_params ON public.image_transformations USING GIN(transformation_params);
CREATE INDEX IF NOT EXISTS idx_image_performance_metrics_url ON public.image_performance_metrics(image_url);
CREATE INDEX IF NOT EXISTS idx_image_performance_metrics_created_at ON public.image_performance_metrics(created_at);

-- Enable RLS for all tables
ALTER TABLE public.image_transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_optimization_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for transformations, admin write access)
CREATE POLICY "Public read access for image transformations" ON public.image_transformations FOR SELECT USING (true);
CREATE POLICY "Admin insert image transformations" ON public.image_transformations FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update image transformations" ON public.image_transformations FOR UPDATE USING (public.is_admin());

CREATE POLICY "Public read image performance metrics" ON public.image_performance_metrics FOR SELECT USING (true);
CREATE POLICY "Public insert image performance metrics" ON public.image_performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage image performance metrics" ON public.image_performance_metrics FOR ALL USING (public.is_admin());

CREATE POLICY "Public read optimization settings" ON public.image_optimization_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage optimization settings" ON public.image_optimization_settings FOR ALL USING (public.is_admin());

-- Create storage bucket for optimized images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'optimized-images',
  'optimized-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for optimized images bucket
CREATE POLICY "Public read access to optimized images" ON storage.objects
FOR SELECT USING (bucket_id = 'optimized-images');

CREATE POLICY "Public upload to optimized images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'optimized-images');

CREATE POLICY "Public update optimized images" ON storage.objects
FOR UPDATE USING (bucket_id = 'optimized-images');

CREATE POLICY "Public delete optimized images" ON storage.objects
FOR DELETE USING (bucket_id = 'optimized-images');
