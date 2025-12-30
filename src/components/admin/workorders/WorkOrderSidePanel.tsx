
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Edit, Calendar, User, Building, FileText, DollarSign, Clock, MessageSquare, CheckCircle, Send, Eye, Wrench } from 'lucide-react';
import WorkOrderFileUpload from './WorkOrderFileUpload';
import WorkOrderCompletionPhotos from './WorkOrderCompletionPhotos';
import WorkOrderBillingFields from './WorkOrderBillingFields';
import { WorkOrderFile } from '@/hooks/useWorkOrderFileUpload';
import { useProperties } from '@/hooks/useProperties';
import WorkOrderFormHeader from './WorkOrderFormHeader';
import WorkOrderBasicFields from './WorkOrderBasicFields';
import WorkOrderDateAccessFields from './WorkOrderDateAccessFields';
import WorkOrderDetailsFields from './WorkOrderDetailsFields';
import WorkOrderFormActions from './WorkOrderFormActions';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

interface OrganizationUser {
  id: string;
  full_name?: string;
  email: string;
}

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
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();
  const [organizationUsers, setOrganizationUsers] = React.useState<OrganizationUser[]>([]);
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'draft',
    contractor_id: '',
    assigned_user_id: '',
    property_id: '',
    estimated_completion_date: '',
    scope_of_work: '',
    special_instructions: '',
    access_code: '',
    // Billing fields
    billing_type: 'hourly',
    billing_rate: undefined as number | undefined,
    hours_worked: undefined as number | undefined,
    billing_amount: undefined as number | undefined,
    payment_status: 'pending',
    payment_notes: '',
  });

  const [attachments, setAttachments] = React.useState<WorkOrderFile[]>([]);
  const [completionPhotos, setCompletionPhotos] = React.useState<WorkOrderFile[]>([]);

  // Fetch organization users
  React.useEffect(() => {
    const fetchOrganizationUsers = async () => {
      if (!organization?.id) return;
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `)
        .eq('organization_id', organization.id);

      if (error) {
        console.error('Error fetching organization users:', error);
        return;
      }

      const users: OrganizationUser[] = (data || [])
        .filter((member: any) => member.profiles)
        .map((member: any) => ({
          id: member.profiles.id,
          full_name: member.profiles.full_name,
          email: member.profiles.email,
        }));

      setOrganizationUsers(users);
    };

    fetchOrganizationUsers();
  }, [organization?.id]);

  React.useEffect(() => {
    if (workOrder) {
      // Editing existing work order
      setFormData({
        title: workOrder.title || '',
        description: workOrder.description || '',
        priority: workOrder.priority || 'medium',
        status: workOrder.status || 'draft',
        contractor_id: workOrder.contractor_id || '',
        assigned_user_id: workOrder.assigned_user_id || '',
        property_id: workOrder.property_id || '',
        estimated_completion_date: workOrder.estimated_completion_date || '',
        scope_of_work: workOrder.scope_of_work || '',
        special_instructions: workOrder.special_instructions || '',
        access_code: workOrder.access_code || '',
        billing_type: workOrder.billing_type || 'hourly',
        billing_rate: workOrder.billing_rate || workOrder.contractor?.hourly_rate,
        hours_worked: workOrder.hours_worked,
        billing_amount: workOrder.billing_amount,
        payment_status: workOrder.payment_status || 'pending',
        payment_notes: workOrder.payment_notes || '',
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
        assigned_user_id: '',
        property_id: '',
        estimated_completion_date: '',
        scope_of_work: '',
        special_instructions: '',
        access_code: '',
        billing_type: 'hourly',
        billing_rate: undefined,
        hours_worked: undefined,
        billing_amount: undefined,
        payment_status: 'pending',
        payment_notes: '',
      });
      setAttachments([]);
      setCompletionPhotos([]);
    }
  }, [workOrder, isOpen]); // Add isOpen to dependencies to reset when panel opens

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For new work orders, require a property to ensure organization_id is set
    const isNewWorkOrder = !workOrder;
    const hasValidProperty = formData.property_id && formData.property_id !== '' && formData.property_id !== 'none';
    
    if (isNewWorkOrder && !hasValidProperty) {
      toast({
        title: 'Property Required',
        description: 'Please select a property for this work order to ensure proper organization assignment.',
        variant: 'destructive',
      });
      return;
    }
    
    const submissionData: any = {
      ...formData,
      property_id: formData.property_id === '' || formData.property_id === 'none' ? undefined : formData.property_id,
      contractor_id: formData.contractor_id === '' || formData.contractor_id === 'none' ? undefined : formData.contractor_id,
      assigned_user_id: formData.assigned_user_id === '' || formData.assigned_user_id === 'none' ? undefined : formData.assigned_user_id,
      estimated_completion_date: formData.estimated_completion_date === '' ? undefined : formData.estimated_completion_date,
      attachments: attachments.map(file => file.url),
      completion_photos: completionPhotos.map(file => file.url),
    };
    
    // Handle status timestamp integrity when editing existing work orders
    if (workOrder) {
      const oldStatus = workOrder.status;
      const newStatus = formData.status;
      
      // Set completed_at when changing TO completed
      if (newStatus === 'completed' && oldStatus !== 'completed' && !workOrder.completed_at) {
        submissionData.completed_at = new Date().toISOString();
      }
      
      // Clear completed_at when changing AWAY from completed
      if (newStatus !== 'completed' && workOrder.completed_at) {
        submissionData.completed_at = null;
      }
      
      // Clear sent_at when going back to draft
      if (newStatus === 'draft' && workOrder.sent_at) {
        submissionData.sent_at = null;
      }
      
      // Clear acknowledged_at when going back to draft or sent
      if ((newStatus === 'draft' || newStatus === 'sent') && workOrder.acknowledged_at) {
        submissionData.acknowledged_at = null;
      }
    }
    
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
                    <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contractor</p>
                      <p className="font-medium">{workOrder.contractor.name}</p>
                      {workOrder.contractor.company_name && (
                        <p className="text-sm text-muted-foreground">{workOrder.contractor.company_name}</p>
                      )}
                    </div>
                  </div>
                )}
                {workOrder.assigned_user && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned Team Member</p>
                      <p className="font-medium">{workOrder.assigned_user.full_name || workOrder.assigned_user.email}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">Internal</Badge>
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

              {/* Status Timeline */}
              {(workOrder.sent_at || workOrder.acknowledged_at || workOrder.completed_at) && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Timeline</h3>
                    </div>
                    <div className="space-y-3">
                      {workOrder.sent_at && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                            <Send className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Sent to Contractor</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(workOrder.sent_at), 'MMM d, yyyy h:mm a')}</p>
                          </div>
                        </div>
                      )}
                      {workOrder.acknowledged_at && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                            <Eye className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Acknowledged</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(workOrder.acknowledged_at), 'MMM d, yyyy h:mm a')}</p>
                          </div>
                        </div>
                      )}
                      {workOrder.completed_at && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Completed</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(workOrder.completed_at), 'MMM d, yyyy h:mm a')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Contractor Notes */}
              {workOrder.contractor_notes && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Contractor Notes</h3>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 whitespace-pre-wrap">{workOrder.contractor_notes}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Billing Summary */}
              {(workOrder.billing_type || workOrder.billing_amount || workOrder.hours_worked) && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Billing Summary</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      {workOrder.billing_type && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Billing Type</span>
                          <span className="font-medium capitalize">{workOrder.billing_type.replace('_', ' ')}</span>
                        </div>
                      )}
                      {workOrder.billing_rate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="font-medium">${workOrder.billing_rate.toFixed(2)}/hr</span>
                        </div>
                      )}
                      {workOrder.hours_worked && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Hours Worked</span>
                          <span className="font-medium">{workOrder.hours_worked} hrs</span>
                        </div>
                      )}
                      {workOrder.billing_amount && (
                        <div className="flex justify-between text-sm border-t pt-2 mt-2">
                          <span className="text-muted-foreground font-medium">Total Amount</span>
                          <span className="font-semibold text-foreground">${workOrder.billing_amount.toFixed(2)}</span>
                        </div>
                      )}
                      {workOrder.payment_status && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Status</span>
                          <Badge className={
                            workOrder.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                            workOrder.payment_status === 'invoiced' ? 'bg-blue-50 text-blue-700' :
                            'bg-amber-50 text-amber-700'
                          }>
                            {workOrder.payment_status}
                          </Badge>
                        </div>
                      )}
                      {workOrder.payment_notes && (
                        <div className="text-sm pt-2 border-t mt-2">
                          <span className="text-muted-foreground block mb-1">Payment Notes</span>
                          <p className="text-foreground">{workOrder.payment_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
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
              organizationUsers={organizationUsers}
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

            {/* Billing Section */}
            <WorkOrderBillingFields
              formData={{
                billing_type: formData.billing_type,
                billing_rate: formData.billing_rate,
                hours_worked: formData.hours_worked,
                billing_amount: formData.billing_amount,
                payment_status: formData.payment_status,
                payment_notes: formData.payment_notes,
              }}
              setFormData={setFormData}
              contractorRate={contractors.find(c => c.id === formData.contractor_id)?.hourly_rate}
              isCompleted={formData.status === 'completed'}
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
