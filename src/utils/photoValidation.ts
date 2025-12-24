/**
 * Photo validation utilities for property image uploads
 */

export interface PhotoValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PhotoValidationOptions {
  maxSizeMB?: number;
  maxFiles?: number;
  allowedFormats?: string[];
  minWidth?: number;
  minHeight?: number;
}

const DEFAULT_OPTIONS: PhotoValidationOptions = {
  maxSizeMB: 15,
  maxFiles: 50,
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
  minWidth: 400,
  minHeight: 300
};

/**
 * Validate a single photo file
 */
export const validatePhotoFile = async (
  file: File,
  options: PhotoValidationOptions = {}
): Promise<PhotoValidationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  if (!opts.allowedFormats?.includes(file.type)) {
    errors.push(`"${file.name}" is not a supported image format. Allowed: JPEG, PNG, WebP, GIF`);
  }

  // Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > (opts.maxSizeMB || 15)) {
    errors.push(`"${file.name}" is too large (${sizeMB.toFixed(1)}MB). Maximum size: ${opts.maxSizeMB}MB`);
  } else if (sizeMB > 5) {
    warnings.push(`"${file.name}" is ${sizeMB.toFixed(1)}MB. Large files will be automatically optimized.`);
  }

  // Check image dimensions (async)
  if (errors.length === 0 && file.type.startsWith('image/')) {
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width < (opts.minWidth || 400) || dimensions.height < (opts.minHeight || 300)) {
        warnings.push(`"${file.name}" is low resolution (${dimensions.width}x${dimensions.height}). Consider using a higher quality image.`);
      }
    } catch (e) {
      // Can't validate dimensions, but file might still be valid
      warnings.push(`Could not verify dimensions for "${file.name}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate multiple photo files
 */
export const validatePhotoFiles = async (
  files: File[],
  existingCount: number = 0,
  options: PhotoValidationOptions = {}
): Promise<PhotoValidationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Check total file count
  const totalCount = existingCount + files.length;
  if (totalCount > (opts.maxFiles || 50)) {
    allErrors.push(`Too many photos. Maximum allowed: ${opts.maxFiles} photos. You have ${existingCount} and are trying to add ${files.length}.`);
    return { valid: false, errors: allErrors, warnings: allWarnings };
  }

  // Validate each file
  for (const file of files) {
    const result = await validatePhotoFile(file, opts);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};

/**
 * Get image dimensions
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
