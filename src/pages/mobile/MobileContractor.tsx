import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Wrench,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  Key,
  Camera,
  LogOut,
  Loader2,
  Lock,
  Building,
  ClipboardList
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
  completed_at: string | null;
  completion_photos: string[] | null;
  contractor_notes: string | null;
  created_at: string;
  properties: {
    id: string;
    title: string;
    address: string | null;
    city: string | null;
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
  low: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-50',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-50',
  high: 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-50',
  critical: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-50'
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  sent: { label: 'Pending', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Clock className="w-4.5 h-4.5" /> },
  acknowledged: { label: 'Acknowledged', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <CheckCircle2 className="w-4.5 h-4.5" /> },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Wrench className="w-4.5 h-4.5" /> },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-100', icon: <CheckCircle2 className="w-4.5 h-4.5" /> },
  invoiced: { label: 'Invoiced', color: 'bg-slate-50 text-slate-700 border-slate-100', icon: <ClipboardList className="w-4.5 h-4.5" /> }
};

const MobileContractor: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('contractor_portal_token'));
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  // Note writing
  const [notesId, setNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  const fetchData = useCallback(async (activeToken: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${EDGE_FUNCTION_URL}?token=${activeToken}&action=get-work-orders`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid or expired contractor token.');
      }

      setContractor(data.contractor);
      setWorkOrders(data.workOrders || []);
      setToken(activeToken);
      localStorage.setItem('contractor_portal_token', activeToken);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to retrieve portal data.');
      localStorage.removeItem('contractor_portal_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token, fetchData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    fetchData(tokenInput.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('contractor_portal_token');
    setToken(null);
    setContractor(null);
    setWorkOrders([]);
    setTokenInput('');
  };

  const updateStatus = async (workOrderId: string, newStatus: string, notes?: string) => {
    if (!token) return;
    try {
      setUpdatingId(workOrderId);
      const response = await fetch(`${EDGE_FUNCTION_URL}?token=${token}&action=update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workOrderId, status: newStatus, notes })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success(`Work order marked as ${newStatus.replace('_', ' ')}`);
      setNotesId(null);
      setNotesText('');
      await fetchData(token);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePhotoUpload = async (workOrderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      setUploadingId(workOrderId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workOrderId', workOrderId);

      const response = await fetch(`${EDGE_FUNCTION_URL}?token=${token}&action=upload-photo`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Completion photo uploaded successfully.');
      await fetchData(token);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  // Login view if token is not registered
  if (!token) {
    return (
      <div className="flex-grow p-6 flex flex-col justify-center items-center">
        <Card className="w-full max-w-sm rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900">
          <CardHeader className="text-center pb-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="font-black text-xl text-slate-800 dark:text-slate-100">
              Contractor Gateway
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your access token to manage cleaning and maintenance jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                required
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste contractor token link..."
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-600 text-sm"
              />
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enter Portal'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 flex flex-col overflow-y-auto space-y-4">
      {/* Portal Header */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
        <div className="space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Contractor</span>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
            {contractor?.name}
          </h3>
          {contractor?.company_name && (
            <p className="text-[10px] text-muted-foreground">{contractor.company_name}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-red-600">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Assigned Jobs</h2>
        <p className="text-xs text-muted-foreground">Manage active work orders</p>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs text-muted-foreground">Retrieving assigned tickets...</p>
        </div>
      ) : workOrders.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-8 text-center flex-grow flex flex-col justify-center">
          <CardContent className="space-y-4 pt-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No active jobs</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                You are all caught up! When a new work order is dispatched to you, it will appear right here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workOrders.map((wo) => {
            const config = statusConfig[wo.status] || statusConfig.sent;
            const isPending = wo.status === 'sent';
            const isAck = wo.status === 'acknowledged';
            const isWorking = wo.status === 'in_progress';
            const isCompleted = wo.status === 'completed' || wo.status === 'invoiced';

            return (
              <Card key={wo.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {wo.work_order_number}
                    </span>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {wo.title}
                    </h3>
                  </div>
                  <Badge className={`${config.color} border flex items-center gap-1 text-[10px] px-2 py-0.5 font-bold rounded-full`}>
                    {config.label}
                  </Badge>
                </div>

                {/* Property Detail */}
                {wo.properties && (
                  <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{wo.properties.title}</p>
                      <p className="text-muted-foreground text-[10px]">{wo.properties.address || wo.properties.city}</p>
                    </div>
                  </div>
                )}

                {/* Entry code */}
                {wo.access_code && (
                  <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <Key className="h-4 w-4 text-indigo-600" />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      Property Access: {wo.access_code}
                    </span>
                  </div>
                )}

                {/* Scopes & Special Instructions */}
                {wo.scope_of_work && (
                  <div className="text-xs p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 space-y-0.5">
                    <span className="font-bold text-amber-800 dark:text-amber-300 uppercase text-[9px] tracking-wider">Scope of Work</span>
                    <p className="text-amber-700 dark:text-amber-400 whitespace-pre-wrap leading-normal">{wo.scope_of_work}</p>
                  </div>
                )}

                {wo.special_instructions && (
                  <div className="text-xs p-3 rounded-2xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 space-y-0.5">
                    <span className="font-bold text-red-800 dark:text-red-300 uppercase text-[9px] tracking-wider">⚠️ Special Instructions</span>
                    <p className="text-red-700 dark:text-red-400 whitespace-pre-wrap leading-normal">{wo.special_instructions}</p>
                  </div>
                )}

                {/* Completion Photos */}
                {wo.completion_photos && wo.completion_photos.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Uploaded Photos</span>
                    <div className="flex flex-wrap gap-2">
                      {wo.completion_photos.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-14 w-14 rounded-xl overflow-hidden border shadow-sm block active:scale-95 transition-transform"
                        >
                          <img src={url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Editor */}
                {notesId === wo.id && (
                  <div className="space-y-1.5 pt-2 border-t">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Closing Notes</span>
                    <Textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Add completion notes for the host..."
                      rows={3}
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50 dark:border-zinc-800/50">
                  {isPending && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(wo.id, 'acknowledged')}
                      disabled={updatingId === wo.id}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs"
                    >
                      {updatingId === wo.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Acknowledge Job'}
                    </Button>
                  )}

                  {isAck && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(wo.id, 'in_progress')}
                      disabled={updatingId === wo.id}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 rounded-xl text-xs text-white"
                    >
                      {updatingId === wo.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Start Work'}
                    </Button>
                  )}

                  {isWorking && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (notesId === wo.id) {
                            updateStatus(wo.id, 'completed', notesText);
                          } else {
                            setNotesId(wo.id);
                            setNotesText(wo.contractor_notes || '');
                          }
                        }}
                        disabled={updatingId === wo.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl text-xs"
                      >
                        {updatingId === wo.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : notesId === wo.id ? (
                          'Confirm Completion'
                        ) : (
                          'Complete Job'
                        )}
                      </Button>

                      <label className="flex-shrink-0 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(wo.id, e)}
                          disabled={uploadingId === wo.id}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingId === wo.id}
                          className="rounded-xl border-slate-200 dark:border-zinc-800 text-xs pointer-events-none"
                        >
                          {uploadingId === wo.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Camera className="h-3.5 w-3.5 mr-1" />
                          )}
                          Photo
                        </Button>
                      </label>
                    </>
                  )}

                  {isCompleted && (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Job Completed
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileContractor;
