import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, User } from 'lucide-react';
import { useGuestPhotoUpload } from '@/hooks/useGuestPhotoUpload';

interface GuestPhotoUploadProps {
  currentPhotoUrl: string;
  onPhotoChange: (url: string) => void;
  disabled?: boolean;
}

const GuestPhotoUpload = ({ currentPhotoUrl, onPhotoChange, disabled }: GuestPhotoUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(currentPhotoUrl);
  const { uploadGuestPhoto, uploading } = useGuestPhotoUpload();

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
    
    const url = await uploadGuestPhoto(file);
    if (url) {
      onPhotoChange(url);
      setManualUrl(url);
    }
  }, [uploadGuestPhoto, onPhotoChange, disabled, uploading]);

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

  const removePhoto = () => {
    onPhotoChange('');
    setManualUrl('');
  };

  const handleManualUrlSubmit = () => {
    onPhotoChange(manualUrl);
    setShowManualInput(false);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="guest-photo">Guest Photo</Label>
      
      {currentPhotoUrl ? (
        <div className="relative">
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <img
              src={currentPhotoUrl}
              alt="Guest avatar"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '';
                target.style.display = 'none';
              }}
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Current photo</p>
              <p className="text-xs text-muted-foreground truncate">{currentPhotoUrl}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removePhoto}
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
          onClick={() => !disabled && !uploading && document.getElementById('guest-photo-input')?.click()}
        >
          <input
            id="guest-photo-input"
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
              <Progress value={75} className="w-full max-w-xs mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              <User className="h-8 w-8 mx-auto text-muted-foreground" />
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

      <div className="flex items-center justify-between">
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
              placeholder="Enter photo URL..."
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

export default GuestPhotoUpload;