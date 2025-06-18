
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ImageTransformation {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
  sharp?: boolean;
}

interface ImageAnalytics {
  url: string;
  loadTime: number;
  bandwidthSaved: number;
  page?: string;
}

export const useAdvancedImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analytics, setAnalytics] = useState<ImageAnalytics[]>([]);

  // Generate optimized image URL using Supabase Edge Function
  const generateOptimizedUrl = useCallback((
    originalUrl: string,
    transformations: ImageTransformation = {}
  ) => {
    try {
      // Use the project reference directly instead of accessing protected property
      const supabaseUrl = 'https://joiovubyokikqjytxtuv.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/image-transform`;
      
      const params = new URLSearchParams({
        url: originalUrl,
        ...Object.fromEntries(
          Object.entries(transformations).map(([key, value]) => [key, String(value)])
        )
      });

      return `${functionUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Error generating optimized URL:', error);
      return originalUrl;
    }
  }, []);

  // Track image performance metrics
  const trackImageLoad = useCallback(async (analytics: ImageAnalytics) => {
    try {
      const { error } = await supabase
        .from('image_performance_metrics')
        .insert({
          image_url: analytics.url,
          page_url: analytics.page || window.location.pathname,
          load_time_ms: analytics.loadTime,
          bandwidth_saved_bytes: analytics.bandwidthSaved,
          user_agent: navigator.userAgent,
          connection_type: (navigator as any).connection?.effectiveType || 'unknown'
        });

      if (error) {
        console.error('Error tracking image analytics:', error);
      } else {
        setAnalytics(prev => [...prev, analytics]);
      }
    } catch (error) {
      console.error('Error saving image analytics:', error);
    }
  }, []);

  // Get cached transformation or create new one
  const getCachedTransformation = useCallback(async (
    originalUrl: string,
    transformParams: ImageTransformation
  ) => {
    try {
      const { data, error } = await supabase
        .from('image_transformations')
        .select('*')
        .eq('original_url', originalUrl)
        .eq('transformation_params', JSON.stringify(transformParams))
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cached transformation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }, []);

  // Save transformation to cache
  const saveTransformation = useCallback(async (
    originalUrl: string,
    transformParams: ImageTransformation,
    optimizedUrl: string,
    metadata?: {
      originalSize?: number;
      optimizedSize?: number;
      originalFormat?: string;
      optimizedFormat?: string;
    }
  ) => {
    try {
      const compressionRatio = metadata?.originalSize && metadata?.optimizedSize
        ? ((metadata.originalSize - metadata.optimizedSize) / metadata.originalSize) * 100
        : null;

      const { error } = await supabase
        .from('image_transformations')
        .insert({
          original_url: originalUrl,
          transformation_params: transformParams,
          optimized_url: optimizedUrl,
          file_size_original: metadata?.originalSize,
          file_size_optimized: metadata?.optimizedSize,
          compression_ratio: compressionRatio,
          format_original: metadata?.originalFormat,
          format_optimized: metadata?.optimizedFormat
        });

      if (error) {
        console.error('Error saving transformation:', error);
      }
    } catch (error) {
      console.error('Error caching transformation:', error);
    }
  }, []);

  // Update access count for cached transformation
  const updateAccessCount = useCallback(async (transformationId: string) => {
    try {
      const { error } = await supabase
        .from('image_transformations')
        .update({
          accessed_count: supabase.sql`accessed_count + 1`,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', transformationId);

      if (error) {
        console.error('Error updating access count:', error);
      }
    } catch (error) {
      console.error('Error tracking access:', error);
    }
  }, []);

  return {
    generateOptimizedUrl,
    trackImageLoad,
    getCachedTransformation,
    saveTransformation,
    updateAccessCount,
    isOptimizing,
    analytics
  };
};
