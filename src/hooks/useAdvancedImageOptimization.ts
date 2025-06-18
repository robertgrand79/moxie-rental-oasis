
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TransformationParams {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: number;
  grayscale?: boolean;
  brightness?: number;
  contrast?: number;
  sharp?: boolean;
}

interface OptimizationSettings {
  qualitySettings: Record<string, number>;
  sizeBreakpoints: Record<string, number>;
  formatPreferences: string[];
  performanceBudget: Record<string, number>;
}

interface ImageAnalytics {
  totalBandwidthSaved: number;
  averageCompressionRatio: number;
  popularFormats: Record<string, number>;
  performanceImpact: {
    averageLoadTime: number;
    totalOptimizations: number;
  };
}

export const useAdvancedImageOptimization = () => {
  const [settings, setSettings] = useState<OptimizationSettings | null>(null);
  const [analytics, setAnalytics] = useState<ImageAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  // Load optimization settings
  useEffect(() => {
    loadOptimizationSettings();
  }, []);

  const loadOptimizationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('image_optimization_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap = data.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {} as Record<string, any>);

      setSettings({
        qualitySettings: settingsMap.quality_settings || {},
        sizeBreakpoints: settingsMap.size_breakpoints || {},
        formatPreferences: settingsMap.format_preferences || [],
        performanceBudget: settingsMap.performance_budget || {}
      });
    } catch (error) {
      console.error('Error loading optimization settings:', error);
    }
  };

  // Generate transformation URL
  const getTransformedImageUrl = (
    originalUrl: string, 
    params: TransformationParams
  ): string => {
    const baseUrl = `${supabase.supabaseUrl}/functions/v1/image-transform`;
    const searchParams = new URLSearchParams({ url: originalUrl });

    if (params.width) searchParams.set('w', params.width.toString());
    if (params.height) searchParams.set('h', params.height.toString());
    if (params.quality) searchParams.set('q', params.quality.toString());
    if (params.format) searchParams.set('f', params.format);
    if (params.blur) searchParams.set('blur', params.blur.toString());
    if (params.grayscale) searchParams.set('grayscale', 'true');
    if (params.brightness) searchParams.set('brightness', params.brightness.toString());
    if (params.contrast) searchParams.set('contrast', params.contrast.toString());
    if (params.sharp) searchParams.set('sharp', 'true');

    return `${baseUrl}?${searchParams.toString()}`;
  };

  // Generate responsive image sources
  const generateResponsiveSources = (originalUrl: string, format?: string) => {
    if (!settings) return {};

    const breakpoints = settings.sizeBreakpoints;
    const preferredFormat = format || settings.formatPreferences[0] || 'webp';
    const quality = settings.qualitySettings[preferredFormat] || 80;

    return {
      thumbnail: getTransformedImageUrl(originalUrl, {
        width: breakpoints.thumbnail,
        format: preferredFormat as any,
        quality
      }),
      medium: getTransformedImageUrl(originalUrl, {
        width: breakpoints.medium,
        format: preferredFormat as any,
        quality
      }),
      large: getTransformedImageUrl(originalUrl, {
        width: breakpoints.large,
        format: preferredFormat as any,
        quality
      }),
      xlarge: getTransformedImageUrl(originalUrl, {
        width: breakpoints.xlarge,
        format: preferredFormat as any,
        quality
      })
    };
  };

  // Smart format detection based on browser support
  const getOptimalFormat = (): string => {
    if (!settings) return 'webp';

    // Check browser support for modern formats
    const supportsAvif = 'avif' in document.createElement('img');
    const supportsWebP = 'webp' in document.createElement('img');

    for (const format of settings.formatPreferences) {
      if (format === 'avif' && supportsAvif) return format;
      if (format === 'webp' && supportsWebP) return format;
      if (['jpeg', 'png'].includes(format)) return format;
    }

    return 'webp';
  };

  // Generate smart placeholder from original image
  const generateSmartPlaceholder = (originalUrl: string): string => {
    return getTransformedImageUrl(originalUrl, {
      width: 20,
      height: 20,
      quality: 10,
      blur: 5
    });
  };

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get transformation analytics
      const { data: transformData, error: transformError } = await supabase
        .from('image_transformations')
        .select('compression_ratio, format_optimized, file_size_original, file_size_optimized');

      if (transformError) throw transformError;

      // Get performance metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('image_performance_metrics')
        .select('bandwidth_saved_bytes, load_time_ms');

      if (metricsError) throw metricsError;

      // Calculate analytics
      const totalBandwidthSaved = transformData.reduce((sum, item) => 
        sum + (item.file_size_original - item.file_size_optimized), 0);

      const averageCompressionRatio = transformData.length > 0 ? 
        transformData.reduce((sum, item) => sum + item.compression_ratio, 0) / transformData.length : 0;

      const popularFormats = transformData.reduce((acc, item) => {
        acc[item.format_optimized] = (acc[item.format_optimized] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageLoadTime = metricsData.length > 0 ?
        metricsData.reduce((sum, item) => sum + (item.load_time_ms || 0), 0) / metricsData.length : 0;

      setAnalytics({
        totalBandwidthSaved,
        averageCompressionRatio,
        popularFormats,
        performanceImpact: {
          averageLoadTime,
          totalOptimizations: transformData.length
        }
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Analytics Error',
        description: 'Failed to load image optimization analytics.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update optimization settings
  const updateSettings = async (newSettings: Partial<OptimizationSettings>) => {
    try {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key.replace(/([A-Z])/g, '_$1').toLowerCase(),
        setting_value: value
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('image_optimization_settings')
          .upsert(update);

        if (error) throw error;
      }

      await loadOptimizationSettings();
      
      toast({
        title: 'Settings Updated',
        description: 'Image optimization settings have been updated successfully.'
      });

    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update optimization settings.',
        variant: 'destructive'
      });
    }
  };

  // Audit existing images for optimization opportunities
  const auditImages = async () => {
    setLoading(true);
    try {
      // Get all blog posts with images
      const { data: blogPosts, error } = await supabase
        .from('blog_posts')
        .select('id, title, image_url')
        .not('image_url', 'is', null);

      if (error) throw error;

      const unoptimizedImages = [];
      const budget = settings?.performanceBudget;

      for (const post of blogPosts) {
        // Check if image is already optimized
        const { data: existing } = await supabase
          .from('image_transformations')
          .select('id')
          .eq('original_url', post.image_url)
          .maybeSingle();

        if (!existing) {
          unoptimizedImages.push({
            postId: post.id,
            postTitle: post.title,
            imageUrl: post.image_url
          });
        }
      }

      return unoptimizedImages;

    } catch (error) {
      console.error('Error auditing images:', error);
      toast({
        title: 'Audit Failed',
        description: 'Failed to audit images for optimization.',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Record performance metrics
  const recordPerformanceMetric = async (
    imageUrl: string,
    loadTimeMs: number,
    pageUrl?: string
  ) => {
    try {
      await supabase
        .from('image_performance_metrics')
        .insert({
          image_url: imageUrl,
          page_url: pageUrl || window.location.href,
          load_time_ms: loadTimeMs,
          user_agent: navigator.userAgent,
          connection_type: (navigator as any).connection?.effectiveType || 'unknown'
        });
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  };

  return {
    settings,
    analytics,
    loading,
    getTransformedImageUrl,
    generateResponsiveSources,
    getOptimalFormat,
    generateSmartPlaceholder,
    loadAnalytics,
    updateSettings,
    auditImages,
    recordPerformanceMetric
  };
};
