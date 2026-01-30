
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { debug } from '@/utils/debug';

interface ImageSizes {
  thumbnail: File;
  medium: File;
  large: File;
  original?: File;
}

interface OptimizationOptions {
  maxWidth?: number;
  quality?: number;
  generateSizes?: boolean;
}

interface OptimizationResult {
  optimizedFile: File;
  sizes?: ImageSizes;
  compressionStats?: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  };
}

export const useImageOptimization = () => {
  const [optimizing, setOptimizing] = useState(false);

  const optimizeImage = async (
    file: File, 
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult | null> => {
    const { 
      maxWidth = 1200, 
      quality = 0.85, 
      generateSizes = true 
    } = options;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive'
      });
      return null;
    }

    setOptimizing(true);
    
    try {
      // Load the image
      const img = await loadImage(file);
      
      // Generate main optimized image
      const mainOptimized = await generateOptimizedImage(img, file, maxWidth, quality);
      
      let sizes: ImageSizes | undefined;
      
      if (generateSizes) {
        // Generate different sizes for responsive delivery
        sizes = await generateImageSizes(img, file, quality);
      }

      const compressionStats = {
        originalSize: file.size,
        optimizedSize: mainOptimized.size,
        compressionRatio: ((file.size - mainOptimized.size) / file.size) * 100
      };

      debug.ui('Image optimization complete:', {
        originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        optimizedSize: `${(mainOptimized.size / 1024 / 1024).toFixed(2)}MB`,
        compression: `${compressionStats.compressionRatio.toFixed(1)}%`,
        sizesGenerated: !!sizes
      });

      return { 
        optimizedFile: mainOptimized, 
        sizes, 
        compressionStats 
      };
      
    } catch (error) {
      debug.error('Image optimization failed:', error);
      toast({
        title: 'Optimization failed',
        description: 'Could not optimize the image. Using original file.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setOptimizing(false);
    }
  };

  return { optimizeImage, optimizing };
};

// Helper functions
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load timeout'));
    }, 10000); // 10 second timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (e) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      reject(e);
    };
    img.src = objectUrl;
  });
};

const calculateDimensions = (img: HTMLImageElement, maxWidth: number) => {
  let { width, height } = img;
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

const generateOptimizedImage = async (
  img: HTMLImageElement, 
  originalFile: File, 
  maxWidth: number, 
  quality: number
): Promise<File> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const { width, height } = calculateDimensions(img, maxWidth);
  
  canvas.width = width;
  canvas.height = height;
  
  // Use high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  
  const blob = await canvasToBlob(canvas, originalFile.type, quality);
  return new File([blob], originalFile.name, {
    type: blob.type,
    lastModified: Date.now()
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Convert PNG to JPEG if no transparency is detected
    const outputType = type === 'image/png' && !hasTransparency(canvas) ? 'image/jpeg' : type;
    
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, outputType, quality);
  });
};

const hasTransparency = (canvas: HTMLCanvasElement): boolean => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Check alpha channel (every 4th pixel)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }
    return false;
  } catch {
    return false; // Assume no transparency if we can't check
  }
};

const generateImageSizes = async (
  img: HTMLImageElement, 
  originalFile: File, 
  quality: number
): Promise<ImageSizes> => {
  const sizeConfigs = [
    { name: 'thumbnail', maxWidth: 300 },
    { name: 'medium', maxWidth: 768 },
    { name: 'large', maxWidth: 1200 }
  ];

  const results: Partial<ImageSizes> = {};

  for (const config of sizeConfigs) {
    const optimizedFile = await generateOptimizedImage(img, originalFile, config.maxWidth, quality);
    
    // Rename file to include size
    const [name, ext] = originalFile.name.split('.');
    const sizedFile = new File([optimizedFile], `${name}_${config.name}.${ext}`, {
      type: optimizedFile.type,
      lastModified: Date.now()
    });

    results[config.name as keyof ImageSizes] = sizedFile;
  }

  return results as ImageSizes;
};
