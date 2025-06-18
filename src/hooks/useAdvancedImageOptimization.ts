
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ImageTransformation {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
  sharp?: boolean;
  blur?: number;
  grayscale?: boolean;
  brightness?: number;
  contrast?: number;
}

interface ImageAnalytics {
  url: string;
  loadTime: number;
  bandwidthSaved: number;
  page?: string;
}

interface AnalyticsData {
  totalBandwidthSaved: number;
  averageCompressionRatio: number;
  popularFormats: Record<string, number>;
  performanceImpact: {
    totalOptimizations: number;
    averageLoadTime: number;
  };
}

interface OptimizationSettings {
  qualitySettings: Record<string, number>;
  sizeBreakpoints: Record<string, number>;
  formatPreferences: string[];
  performanceBudget: Record<string, any>;
}

export const useAdvancedImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [settings, setSettings] = useState<OptimizationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate optimized image URL using Supabase Edge Function
  const generateOptimizedUrl = useCallback((
    originalUrl: string,
    transformations: ImageTransformation = {}
  ) => {
    try {
      // If it's already a Supabase URL or the edge function is not available, return original
      if (!originalUrl || originalUrl.includes('image-transform')) {
        return originalUrl;
      }

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

  // Generate responsive sources
  const generateResponsiveSources = useCallback((originalUrl: string, format?: string) => {
    const sizes = [300, 768, 1200, 1920];
    const sources: Record<string, string> = {};
    
    sizes.forEach((size, index) => {
      const sizeNames = ['thumbnail', 'medium', 'large', 'xlarge'];
      try {
        sources[sizeNames[index]] = generateOptimizedUrl(originalUrl, {
          width: size,
          format: format as any || 'webp',
          quality: 85
        });
      } catch (error) {
        console.error('Error generating responsive source:', error);
        sources[sizeNames[index]] = originalUrl;
      }
    });
    
    return sources;
  }, [generateOptimizedUrl]);

  // Get optimal format based on browser support
  const getOptimalFormat = useCallback(() => {
    if (typeof window === 'undefined') return 'jpeg';
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      // Check for AVIF support
      if (canvas.toDataURL('image/avif').startsWith('data:image/avif')) {
        return 'avif';
      }
      
      // Check for WebP support
      if (canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
        return 'webp';
      }
      
      return 'jpeg';
    } catch (error) {
      console.error('Error detecting optimal format:', error);
      return 'jpeg';
    }
  }, []);

  // Generate smart placeholder
  const generateSmartPlaceholder = useCallback((originalUrl: string) => {
    try {
      return generateOptimizedUrl(originalUrl, {
        width: 20,
        height: 20,
        quality: 20,
        blur: 10
      });
    } catch (error) {
      console.error('Error generating smart placeholder:', error);
      return '';
    }
  }, [generateOptimizedUrl]);

  // Get transformed image URL (alias for generateOptimizedUrl)
  const getTransformedImageUrl = useCallback((
    originalUrl: string,
    transformations: ImageTransformation
  ) => {
    return generateOptimizedUrl(originalUrl, transformations);
  }, [generateOptimizedUrl]);

  // Record performance metrics
  const recordPerformanceMetric = useCallback(async (url: string, loadTime: number) => {
    try {
      await trackImageLoad({
        url,
        loadTime,
        bandwidthSaved: 0,
        page: window.location.pathname
      });
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }, []);

  // Track image performance metrics
  const trackImageLoad = useCallback(async (analyticsData: ImageAnalytics) => {
    try {
      const { error } = await supabase
        .from('image_performance_metrics')
        .insert({
          image_url: analyticsData.url,
          page_url: analyticsData.page || window.location.pathname,
          load_time_ms: analyticsData.loadTime,
          bandwidth_saved_bytes: analyticsData.bandwidthSaved,
          user_agent: navigator.userAgent,
          connection_type: (navigator as any).connection?.effectiveType || 'unknown'
        });

      if (error) {
        console.error('Error tracking image analytics:', error);
      }
    } catch (error) {
      console.error('Error saving image analytics:', error);
    }
  }, []);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch performance metrics
      const { data: metrics } = await supabase
        .from('image_performance_metrics')
        .select('*');

      // Fetch transformations
      const { data: transformations } = await supabase
        .from('image_transformations')
        .select('*');

      // Process analytics data
      if (metrics && transformations) {
        const totalBandwidthSaved = metrics.reduce((sum, m) => sum + (m.bandwidth_saved_bytes || 0), 0);
        const averageLoadTime = metrics.length > 0 
          ? metrics.reduce((sum, m) => sum + (m.load_time_ms || 0), 0) / metrics.length 
          : 0;
        
        const formatCounts: Record<string, number> = {};
        transformations.forEach(t => {
          const format = t.format_optimized || 'unknown';
          formatCounts[format] = (formatCounts[format] || 0) + 1;
        });

        const averageCompression = transformations.length > 0
          ? transformations.reduce((sum, t) => sum + (t.compression_ratio || 0), 0) / transformations.length
          : 0;

        setAnalytics({
          totalBandwidthSaved,
          averageCompressionRatio: averageCompression,
          popularFormats: formatCounts,
          performanceImpact: {
            totalOptimizations: transformations.length,
            averageLoadTime
          }
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Audit images for optimization opportunities
  const auditImages = useCallback(async () => {
    try {
      // Get all blog posts with images
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('id, title, image_url')
        .not('image_url', 'is', null);

      return blogPosts?.map(post => ({
        postTitle: post.title,
        imageUrl: post.image_url
      })) || [];
    } catch (error) {
      console.error('Error auditing images:', error);
      return [];
    }
  }, []);

  // Update optimization settings
  const updateSettings = useCallback(async (newSettings: Partial<OptimizationSettings>) => {
    try {
      for (const [key, value] of Object.entries(newSettings)) {
        await supabase
          .from('image_optimization_settings')
          .upsert({
            setting_key: key,
            setting_value: value as any,
            updated_at: new Date().toISOString()
          });
      }
      
      // Reload settings
      const { data } = await supabase
        .from('image_optimization_settings')
        .select('*');
      
      if (data) {
        const settingsObj = data.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as any);
        
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }, []);

  return {
    generateOptimizedUrl,
    generateResponsiveSources,
    getOptimalFormat,
    generateSmartPlaceholder,
    getTransformedImageUrl,
    recordPerformanceMetric,
    trackImageLoad,
    loadAnalytics,
    auditImages,
    updateSettings,
    isOptimizing,
    analytics,
    settings,
    loading
  };
};
