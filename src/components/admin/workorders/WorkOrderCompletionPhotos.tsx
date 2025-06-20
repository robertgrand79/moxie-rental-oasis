
import React from 'react';
import WorkOrderFileUpload from './WorkOrderFileUpload';
import { WorkOrderFile } from '@/hooks/useWorkOrderFileUpload';

interface WorkOrderCompletionPhotosProps {
  photos: WorkOrderFile[];
  onPhotosChange: (photos: WorkOrderFile[]) => void;
  workOrderId?: string;
}

const WorkOrderCompletionPhotos = ({
  photos,
  onPhotosChange,
  workOrderId,
}: WorkOrderCompletionPhotosProps) => {
  return (
    <WorkOrderFileUpload
      files={photos}
      onFilesChange={onPhotosChange}
      workOrderId={workOrderId}
      label="Completion Photos"
      maxFiles={20}
      acceptedTypes={[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
      ]}
    />
  );
};

export default WorkOrderCompletionPhotos;
