import React from 'react';
import ImmersiveLightbox from './ImmersiveLightbox';

interface PropertyPhotoModalProps {
  images: string[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const PropertyPhotoModal = (props: PropertyPhotoModalProps) => {
  return <ImmersiveLightbox {...props} />;
};

export default PropertyPhotoModal;
