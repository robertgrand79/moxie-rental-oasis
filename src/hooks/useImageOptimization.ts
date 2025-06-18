
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface ImageSizes {
  thumbnail: string;
  medium: string;
  large: string;
  original?: string;
}

interface OptimizationOptions {
  maxWidth?: number;
  quality?: number;
  generateSizes?: boolean;
}

export const useImageOptimization = () => {
  const [optimizing, setOptimizing] = useState(false);

  const optimizeImage = async (
    file: File, 
    options: OptimizationOptions = {}
  ): Promise<{ optimizedFile: File; sizes?: ImageSizes } | null> => {
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
      // Create canvas and context
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Load the image
      const img = await loadImage(file);
      
      // Calculate dimensions maintaining aspect ratio
      const { width, height } = calculateDimensions(img, maxWidth);
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Generate optimized file
      const optimizedBlob = await canvasToBlob(canvas, file.type, quality);
      const optimizedFile = new File([optimizedBlob], file.name, {
        type: optimizedBlob.type,
        lastModified: Date.now()
      });

      let sizes: ImageSizes | undefined;
      
      if (generateSizes) {
        // Generate different sizes
        sizes = await generateImageSizes(img, file.name, file.type, quality);
      }

      console.log('📏 Image optimization complete:', {
        originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        optimizedSize: `${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`,
        dimensions: `${width}x${height}`,
        compression: `${(((file.size - optimizedFile.size) / file.size) * 100).toFixed(1)}%`
      });

      return { optimizedFile, sizes };
      
    } catch (error) {
      console.error('❌ Image optimization failed:', error);
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
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
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

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, type === 'image/png' ? 'image/jpeg' : type, quality);
  });
};

const generateImageSizes = async (
  img: HTMLImageElement, 
  fileName: string, 
  fileType: string, 
  quality: number
): Promise<ImageSizes> => {
  const sizes = [
    { name: 'thumbnail', maxWidth: 300 },
    { name: 'medium', maxWidth: 768 },
    { name: 'large', maxWidth: 1200 }
  ];

  const results: Partial<ImageSizes> = {};

  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    const { width, height } = calculateDimensions(img, size.maxWidth);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, fileType, quality);
    const file = new File([blob], `${size.name}_${fileName}`, {
      type: blob.type,
      lastModified: Date.now()
    });

    // Create object URL for preview
    results[size.name as keyof ImageSizes] = URL.createObjectURL(file);
  }

  return results as ImageSizes;
};
