
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Separator } from '@/components/ui/separator';
import { Paperclip } from 'lucide-react';
import WorkOrderFileUpload from './WorkOrderFileUpload';
import WorkOrderCompletionPhotos from './WorkOrderCompletionPhotos';
import { WorkOrderFile } from '@/hooks/useWorkOrderFileUpload';
import { useProperties } from '@/hooks/useProperties';
import WorkOrderFormHeader from './WorkOrderFormHeader';
import WorkOrderBasicFields from './WorkOrderBasicFields';
import WorkOrderDateAccessFields from './WorkOrderDateAccessFields';
import WorkOrderDetailsFields from './WorkOrderDetailsFields';
import WorkOrderFormActions from './WorkOrderFormActions';

interface WorkOrderSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  contractors: any[];
  onSave: (data: any) => void;
  isEditing: boolean;
}

const WorkOrderSidePanel = ({
  isOpen,
  onClose,
  workOrder,
  contractors,
  onSave,
  isEditing,
}: WorkOrderSidePanelProps) => {
  const { properties } = useProperties();
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'draft',
    contractor_id: '',
    property_id: '',
    estimated_completion_date: '',
    scope_of_work: '',
    special_instructions: '',
    access_code: '',
  });

  const [attachments, setAttachments] = React.useState<WorkOrderFile[]>([]);
  const [completionPhotos, setCompletionPhotos] = React.useState<WorkOrderFile[]>([]);

  React.useEffect(() => {
    if (workOrder) {
      // Editing existing work order
      setFormData({
        title: workOrder.title || '',
        description: workOrder.description || '',
        priority: workOrder.priority || 'medium',
        status: workOrder.status || 'draft',
        contractor_id: workOrder.contractor_id || '',
        property_id: workOrder.property_id || '',
        estimated_completion_date: workOrder.estimated_completion_date || '',
        scope_of_work: workOrder.scope_of_work || '',
        special_instructions: workOrder.special_instructions || '',
        access_code: workOrder.access_code || '',
      });

      // Convert existing attachments to WorkOrderFile format
      const existingAttachments: WorkOrderFile[] = (workOrder.attachments || []).map((url, index) => ({
        id: `existing-${index}`,
        name: url.split('/').pop() || `attachment-${index}`,
        url,
        type: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'document',
        mimeType: url.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg' : 
                  url.match(/\.png$/i) ? 'image/png' :
                  url.match(/\.pdf$/i) ? 'application/pdf' : 'application/octet-stream',
        size: 0,
        uploadedAt: workOrder.created_at,
      }));

      const existingPhotos: WorkOrderFile[] = (workOrder.completion_photos || []).map((url, index) => ({
        id: `photo-${index}`,
        name: url.split('/').pop() || `photo-${index}`,
        url,
        type: 'image' as const,
        mimeType: 'image/jpeg',
        size: 0,
        uploadedAt: workOrder.completed_at || workOrder.created_at,
      }));

      setAttachments(existingAttachments);
      setCompletionPhotos(existingPhotos);
    } else {
      // Creating new work order - reset all fields
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'draft',
        contractor_id: '',
        property_id: '',
        estimated_completion_date: '',
        scope_of_work: '',
        special_instructions: '',
        access_code: '',
      });
      setAttachments([]);
      setCompletionPhotos([]);
    }
  }, [workOrder, isOpen]); // Add isOpen to dependencies to reset when panel opens

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      property_id: formData.property_id === '' || formData.property_id === 'none' ? undefined : formData.property_id,
      contractor_id: formData.contractor_id === '' || formData.contractor_id === 'none' ? undefined : formData.contractor_id,
      estimated_completion_date: formData.estimated_completion_date === '' ? undefined : formData.estimated_completion_date,
      attachments: attachments.map(file => file.url),
      completion_photos: completionPhotos.map(file => file.url),
    };
    
    onSave(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden sm:max-w-2xl">
        <div className="h-full flex flex-col max-h-screen">
          <WorkOrderFormHeader
            isEditing={isEditing}
            workOrder={workOrder}
            onClose={onClose}
          />

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6"
                style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <WorkOrderBasicFields
              formData={formData}
              setFormData={setFormData}
              properties={properties}
              contractors={contractors}
            />

            <WorkOrderDateAccessFields
              formData={formData}
              setFormData={setFormData}
            />

            <WorkOrderDetailsFields
              formData={formData}
              setFormData={setFormData}
            />

            <Separator />

            {/* File Attachments Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">File Attachments</h3>
              </div>
              
              <WorkOrderFileUpload
                files={attachments}
                onFilesChange={setAttachments}
                workOrderId={workOrder?.id}
                label="Work Order Attachments"
                maxFiles={10}
              />
            </div>

            {/* Completion Photos Section - Only show for in-progress or completed work orders */}
            {(formData.status === 'in_progress' || formData.status === 'completed') && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Completion Documentation</h3>
                  <WorkOrderCompletionPhotos
                    photos={completionPhotos}
                    onPhotosChange={setCompletionPhotos}
                    workOrderId={workOrder?.id}
                  />
                </div>
              </>
            )}

            <div className="pb-4">
              <WorkOrderFormActions
                isEditing={isEditing}
                onClose={onClose}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderSidePanel;
