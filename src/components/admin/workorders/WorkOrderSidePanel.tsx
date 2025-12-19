
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Edit, Calendar, User, Building, FileText } from 'lucide-react';
import WorkOrderFileUpload from './WorkOrderFileUpload';
import WorkOrderCompletionPhotos from './WorkOrderCompletionPhotos';
import { WorkOrderFile } from '@/hooks/useWorkOrderFileUpload';
import { useProperties } from '@/hooks/useProperties';
import WorkOrderFormHeader from './WorkOrderFormHeader';
import WorkOrderBasicFields from './WorkOrderBasicFields';
import WorkOrderDateAccessFields from './WorkOrderDateAccessFields';
import WorkOrderDetailsFields from './WorkOrderDetailsFields';
import WorkOrderFormActions from './WorkOrderFormActions';
import { format } from 'date-fns';

interface WorkOrderSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  contractors: any[];
  onSave: (data: any) => void;
  isEditing: boolean;
  isViewOnly?: boolean;
  onEditClick?: () => void;
}

const WorkOrderSidePanel = ({
  isOpen,
  onClose,
  workOrder,
  contractors,
  onSave,
  isEditing,
  isViewOnly = false,
  onEditClick,
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

  // View-only mode
  if (isViewOnly && workOrder) {
    const statusColors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      sent: 'bg-blue-50 text-blue-700',
      acknowledged: 'bg-purple-50 text-purple-700',
      in_progress: 'bg-amber-50 text-amber-700',
      completed: 'bg-emerald-50 text-emerald-700',
      invoiced: 'bg-indigo-50 text-indigo-700',
      paid: 'bg-emerald-50 text-emerald-700',
      cancelled: 'bg-red-50 text-red-700',
    };

    const priorityColors: Record<string, string> = {
      low: 'bg-emerald-50 text-emerald-700',
      medium: 'bg-amber-50 text-amber-700',
      high: 'bg-orange-50 text-orange-700',
      critical: 'bg-red-50 text-red-700',
    };

    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1 bg-black/20" onClick={onClose} />
        <div className="w-full max-w-2xl bg-card shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden">
          <div className="h-full flex flex-col max-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-muted-foreground">{workOrder.work_order_number}</span>
                  <Badge className={statusColors[workOrder.status] || 'bg-muted'}>
                    {workOrder.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={priorityColors[workOrder.priority] || 'bg-muted'}>
                    {workOrder.priority}
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold text-foreground">{workOrder.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                {onEditClick && (
                  <Button onClick={onEditClick} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button onClick={onClose} variant="ghost" size="sm">
                  Close
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4">
                {workOrder.property && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">{workOrder.property.title}</p>
                    </div>
                  </div>
                )}
                {workOrder.contractor && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contractor</p>
                      <p className="font-medium">{workOrder.contractor.name}</p>
                      {workOrder.contractor.company_name && (
                        <p className="text-sm text-muted-foreground">{workOrder.contractor.company_name}</p>
                      )}
                    </div>
                  </div>
                )}
                {workOrder.estimated_completion_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{format(new Date(workOrder.estimated_completion_date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{format(new Date(workOrder.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              {workOrder.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{workOrder.description}</p>
                </div>
              )}

              {/* Scope of Work */}
              {workOrder.scope_of_work && (
                <div>
                  <h3 className="font-medium mb-2">Scope of Work</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{workOrder.scope_of_work}</p>
                </div>
              )}

              {/* Special Instructions */}
              {workOrder.special_instructions && (
                <div>
                  <h3 className="font-medium mb-2">Special Instructions</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{workOrder.special_instructions}</p>
                </div>
              )}

              {/* Access Code */}
              {workOrder.access_code && (
                <div>
                  <h3 className="font-medium mb-2">Access Code</h3>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{workOrder.access_code}</code>
                </div>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Attachments ({attachments.length})</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {attachments.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Completion Photos */}
              {completionPhotos.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-3">Completion Photos ({completionPhotos.length})</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {completionPhotos.map((photo) => (
                        <a
                          key={photo.id}
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                        >
                          <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-full max-w-2xl bg-card shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden sm:max-w-2xl">
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
                <Paperclip className="h-5 w-5 text-muted-foreground" />
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
