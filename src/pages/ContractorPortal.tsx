import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Upload, 
  MapPin, 
  Calendar, 
  Key,
  AlertCircle,
  Loader2,
  Camera,
  FileText,
  Building2
} from 'lucide-react';

interface WorkOrder {
  id: string;
  work_order_number: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  estimated_completion_date: string | null;
  access_code: string | null;
  scope_of_work: string | null;
  special_instructions: string | null;
  acknowledged_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  completion_photos: string[] | null;
  contractor_notes: string | null;
  created_at: string;
  properties: {
    id: string;
    title: string;
    location: string | null;
    address: string | null;
  } | null;
}

interface Contractor {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
}

const EDGE_FUNCTION_URL = 'https://joiovubyokikqjytxtuv.supabase.co/functions/v1/contractor-portal';

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  sent: { label: 'Pending', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" /> },
  acknowledged: { label: 'Acknowledged', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle2 className="w-4 h-4" /> },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800', icon: <Wrench className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-4 h-4" /> },
  invoiced: { label: 'Invoiced', color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-4 h-4" /> }
};

const ContractorPortal: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${EDGE_FUNCTION_URL}?token=${token}&action=get-work-orders`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load data');
      }

      setContractor(data.contractor);
      setWorkOrders(data.workOrders);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (workOrderId: string, newStatus: string, notes?: string) => {
    try {
      setUpdatingStatus(workOrderId);
      const response = await fetch(`${EDGE_FUNCTION_URL}?token=${token}&action=update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workOrderId, status: newStatus, notes })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({ title: 'Status Updated', description: `Work order marked as ${newStatus.replace('_', ' ')}` });
      setExpandedNotes(null);
      setNoteText('');
      await fetchData();
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to update status',
        variant: 'destructive'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const uploadPhoto = async (workOrderId: string, file: File) => {
    try {
      setUploadingPhoto(workOrderId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workOrderId', workOrderId);

      const response = await fetch(`${EDGE_FUNCTION_URL}?token=${token}&action=upload-photo`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({ title: 'Photo Uploaded', description: 'Completion photo added successfully' });
      await fetchData();
    } catch (err) {
      toast({ 
        title: 'Upload Failed', 
        description: err instanceof Error ? err.message : 'Failed to upload photo',
        variant: 'destructive'
      });
    } finally {
      setUploadingPhoto(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your work orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-4">
              If you believe this is an error, please contact Moxie Vacation Rentals.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Moxie Contractor Portal</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {contractor?.name} {contractor?.company_name && `(${contractor.company_name})`}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Work Orders</h2>
          <p className="text-sm text-muted-foreground">
            {workOrders.length} active work order{workOrders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {workOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Active Work Orders</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workOrders.map((wo) => {
              const status = statusConfig[wo.status] || statusConfig.sent;
              const canAcknowledge = wo.status === 'sent';
              const canStart = wo.status === 'acknowledged';
              const canComplete = wo.status === 'in_progress';
              const isCompleted = wo.status === 'completed' || wo.status === 'invoiced';

              return (
                <Card key={wo.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-muted-foreground">
                            {wo.work_order_number}
                          </span>
                          <Badge variant="outline" className={priorityColors[wo.priority] || ''}>
                            {wo.priority}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{wo.title}</CardTitle>
                      </div>
                      <Badge className={`${status.color} flex items-center gap-1`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Property Info */}
                    {wo.properties && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{wo.properties.title}</p>
                          <p className="text-muted-foreground">{wo.properties.address || wo.properties.location}</p>
                        </div>
                      </div>
                    )}

                    {/* Due Date */}
                    {wo.estimated_completion_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Due: {formatDate(wo.estimated_completion_date)}</span>
                      </div>
                    )}

                    {/* Access Code */}
                    {wo.access_code && (
                      <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
                        <Key className="w-4 h-4 text-blue-600" />
                        <span className="font-mono font-medium text-blue-900">{wo.access_code}</span>
                      </div>
                    )}

                    {/* Description */}
                    {wo.description && (
                      <div className="text-sm">
                        <p className="font-medium mb-1">Description</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{wo.description}</p>
                      </div>
                    )}

                    {/* Scope of Work */}
                    {wo.scope_of_work && (
                      <div className="text-sm bg-amber-50 p-3 rounded-lg">
                        <p className="font-medium mb-1 text-amber-900">Scope of Work</p>
                        <p className="text-amber-800 whitespace-pre-wrap">{wo.scope_of_work}</p>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {wo.special_instructions && (
                      <div className="text-sm bg-red-50 p-3 rounded-lg">
                        <p className="font-medium mb-1 text-red-900">⚠️ Special Instructions</p>
                        <p className="text-red-800 whitespace-pre-wrap">{wo.special_instructions}</p>
                      </div>
                    )}

                    {/* Completion Photos */}
                    {wo.completion_photos && wo.completion_photos.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">Completion Photos</p>
                        <div className="flex flex-wrap gap-2">
                          {wo.completion_photos.map((url, idx) => (
                            <a 
                              key={idx} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block w-20 h-20 rounded-lg overflow-hidden border hover:opacity-80 transition"
                            >
                              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes Input */}
                    {expandedNotes === wo.id && (
                      <div className="space-y-2 pt-2 border-t">
                        <Textarea
                          placeholder="Add notes about the work..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {canAcknowledge && (
                        <Button
                          onClick={() => updateStatus(wo.id, 'acknowledged')}
                          disabled={updatingStatus === wo.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updatingStatus === wo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          )}
                          Acknowledge
                        </Button>
                      )}

                      {canStart && (
                        <Button
                          onClick={() => updateStatus(wo.id, 'in_progress')}
                          disabled={updatingStatus === wo.id}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          {updatingStatus === wo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Wrench className="w-4 h-4 mr-2" />
                          )}
                          Start Work
                        </Button>
                      )}

                      {canComplete && (
                        <>
                          <Button
                            onClick={() => {
                              if (expandedNotes === wo.id) {
                                updateStatus(wo.id, 'completed', noteText);
                              } else {
                                setExpandedNotes(wo.id);
                                setNoteText(wo.contractor_notes || '');
                              }
                            }}
                            disabled={updatingStatus === wo.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updatingStatus === wo.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            {expandedNotes === wo.id ? 'Confirm Complete' : 'Mark Complete'}
                          </Button>

                          {/* Photo Upload */}
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadPhoto(wo.id, file);
                              }}
                              disabled={uploadingPhoto === wo.id}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="pointer-events-none"
                              disabled={uploadingPhoto === wo.id}
                            >
                              {uploadingPhoto === wo.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Camera className="w-4 h-4 mr-2" />
                              )}
                              Add Photo
                            </Button>
                          </label>
                        </>
                      )}

                      {isCompleted && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed on {formatDate(wo.completed_at)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at <a href="mailto:team@moxievacationrentals.com" className="text-primary hover:underline">team@moxievacationrentals.com</a></p>
          <p className="mt-1">or call <a href="tel:+15412551698" className="text-primary hover:underline">541-255-1698</a></p>
        </div>
      </footer>
    </div>
  );
};

export default ContractorPortal;