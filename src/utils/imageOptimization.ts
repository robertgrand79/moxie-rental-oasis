// Image optimization utilities for better performance and user experience

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  maxWidth?: number;
  maxHeight?: number;
  progressive?: boolean;
}

// Convert file to WebP format for better compression
export const convertToWebP = async (file: File, options: ImageOptimizationOptions = {}): Promise<File> => {
  const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;
        
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }
            
            const webpFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, '.webp'), 
              { type: 'image/webp' }
            );
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Generate multiple sizes for responsive images
export const generateResponsiveSizes = async (
  file: File, 
  sizes: number[] = [320, 640, 960, 1280, 1920]
): Promise<{ size: number; file: File }[]> => {
  const results: { size: number; file: File }[] = [];
  
  for (const size of sizes) {
    try {
      const resizedFile = await convertToWebP(file, { 
        maxWidth: size, 
        maxHeight: size,
        quality: size <= 640 ? 0.85 : 0.8 // Higher quality for smaller images
      });
      results.push({ size, file: resizedFile });
    } catch (error) {
      console.warn(`Failed to generate ${size}px version:`, error);
    }
  }
  
  return results;
};

// Create optimized thumbnail
export const createThumbnail = async (file: File, size: number = 300): Promise<File> => {
  return convertToWebP(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.85
  });
};

// Check if browser supports WebP
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Get optimized image URL with Supabase transformations
//
// NOTE: Supabase Image Transformation (/render/image/ endpoint) requires the
// Pro plan add-on. Until that is enabled, this function returns the original
// /object/public/ URL unchanged — images load correctly without transformation.
// To enable: Supabase dashboard → Storage → Image Transformations → Enable,
// then flip SUPABASE_IMAGE_TRANSFORM_ENABLED to true below.
const SUPABASE_IMAGE_TRANSFORM_ENABLED = false;

export const getOptimizedImageUrl = (
  baseUrl: string,
  options: { width?: number; height?: number; quality?: number; format?: string } = {}
): string => {
  if (!baseUrl) return baseUrl;

  // Relative paths are returned as-is
  if (baseUrl.startsWith('/') || baseUrl.startsWith('./') || baseUrl.startsWith('../')) {
    return baseUrl;
  }

  // When transform is disabled, return original URL directly.
  // The /render/image/ endpoint returns 400 on free/starter plans which causes
  // images to fail silently in the browser.
  if (!SUPABASE_IMAGE_TRANSFORM_ENABLED) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);

    if (!url.hostname.includes('supabase')) {
      return baseUrl;
    }

    // Convert /storage/v1/object/public/ → /storage/v1/render/image/public/
    if (url.pathname.includes('/storage/v1/object/public/')) {
      url.pathname = url.pathname.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      );
    }

    if (!url.pathname.includes('/storage/v1/render/image/')) {
      return baseUrl;
    }

    const { width, height, quality = 80, format = 'webp' } = options;

    if (width) url.searchParams.set('width', width.toString());
    if (height) url.searchParams.set('height', height.toString());
    url.searchParams.set('quality', quality.toString());
    url.searchParams.set('format', format);

    return url.toString();
  } catch (error) {
    console.warn('⚠️ Could not optimize image URL, using original:', baseUrl);
    return baseUrl;
  }
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Calculate file size reduction
export const calculateOptimizationSavings = (originalSize: number, optimizedSize: number) => {
  const savings = originalSize - optimizedSize;
  const percentage = Math.round((savings / originalSize) * 100);
  
  return {
    savings,
    percentage,
    originalSize,
    optimizedSize
  };
};