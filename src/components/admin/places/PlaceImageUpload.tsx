import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import { usePlaceImageUpload } from '@/hooks/usePlaceImageUpload';
import { fetchWebsiteImage } from '@/lib/api/fetchWebsiteImage';
import { toast } from 'sonner';

interface PlaceImageUploadProps {
  currentImageUrl: string;
  websiteUrl: string;
  onImageChange: (url: string) => void;
  disabled?: boolean;
}

const PlaceImageUpload = ({ currentImageUrl, websiteUrl, onImageChange, disabled }: PlaceImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(currentImageUrl);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const { uploadPlaceImage, uploading } = usePlaceImageUpload();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled || uploading) return;
    
    const url = await uploadPlaceImage(file);
    if (url) {
      onImageChange(url);
      setManualUrl(url);
    }
  }, [uploadPlaceImage, onImageChange, disabled, uploading]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, [handleFileSelect, disabled, uploading]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const removeImage = () => {
    onImageChange('');
    setManualUrl('');
  };

  const handleManualUrlSubmit = () => {
    onImageChange(manualUrl);
    setShowManualInput(false);
  };

  const handleFetchImage = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL first');
      return;
    }

    setIsFetchingImage(true);
    try {
      const newImageUrl = await fetchWebsiteImage(websiteUrl);
      onImageChange(newImageUrl);
      setManualUrl(newImageUrl);
      toast.success('Image fetched and uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch image');
    } finally {
      setIsFetchingImage(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Place Image</Label>
      
      {currentImageUrl ? (
        <div className="relative">
          <div className="flex items-start space-x-4 p-4 border rounded-lg">
            <img
              src={currentImageUrl}
              alt="Place"
              className="w-32 h-20 rounded object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
              }}
            />
            <div className="w-32 h-20 rounded bg-muted flex items-center justify-center hidden fallback-icon">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Current image</p>
              <p className="text-xs text-muted-foreground truncate">{currentImageUrl}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeImage}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && document.getElementById('place-image-input')?.click()}
        >
          <input
            id="place-image-input"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || uploading}
          />
          
          {uploading ? (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {dragActive ? 'Drop the image here' : 'Drag and drop an image, or click to select'}
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, or GIF up to 10MB
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFetchImage}
          disabled={!websiteUrl || isFetchingImage || disabled || uploading}
        >
          {isFetchingImage ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Fetch from Website
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowManualInput(!showManualInput)}
          disabled={disabled || uploading}
        >
          {showManualInput ? 'Hide URL Input' : 'Enter URL Manually'}
        </Button>
      </div>

      {showManualInput && (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="Enter image URL..."
              disabled={disabled || uploading}
            />
            <Button
              type="button"
              onClick={handleManualUrlSubmit}
              disabled={disabled || uploading || !manualUrl.trim()}
            >
              Set
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceImageUpload;
