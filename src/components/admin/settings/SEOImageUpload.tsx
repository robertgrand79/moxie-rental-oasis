import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useSEOImageUpload } from '@/hooks/useSEOImageUpload';

interface SEOImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  type: 'og' | 'favicon';
  label: string;
}

const SEOImageUpload = ({ imageUrl, onImageChange, type, label }: SEOImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadSEOImage, uploading } = useSEOImageUpload();

  const handleFileSelect = async (file: File) => {
    const uploadedUrl = await uploadSEOImage(file, type);
    if (uploadedUrl) {
      onImageChange(uploadedUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelect(file);
    }
    // Reset the input
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onImageChange('');
  };

  const getRecommendedSize = () => {
    return type === 'og' ? '1200×630px' : '32×32px';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : `Upload ${label}`}
        </Button>
        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeImage}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'favicon' ? 'image/*' : 'image/jpeg,image/png,image/webp,image/gif'}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="text-sm text-muted-foreground">
        Recommended size: {getRecommendedSize()}
      </div>

      {imageUrl && (
        <div className="border rounded-lg p-3 bg-card">
          <div className="flex items-center gap-3">
            <div className={`border rounded ${type === 'favicon' ? 'w-8 h-8' : 'w-16 h-16'} bg-muted flex items-center justify-center overflow-hidden`}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={`${label} preview`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="text-muted-foreground"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                    }
                  }}
                />
              ) : (
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Current {label}</p>
              <p className="text-xs text-muted-foreground truncate">{imageUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOImageUpload;