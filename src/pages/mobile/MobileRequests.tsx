import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformInbox, PlatformInboxItem } from '@/hooks/usePlatformInbox';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Inbox,
  Ticket,
  Wrench,
  Wifi,
  Sparkles,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

const MobileRequests: React.FC = () => {
  const { user } = useAuth();
  const { useUserInboxItems, createItemAsync } = usePlatformInbox();
  
  // Fetch user requests
  const { data: requests = [], isLoading, refetch } = useUserInboxItems(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('maintenance');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reservations to find organization_id
  const { data: reservations = [] } = useQuery({
    queryKey: ['mobile-requests-reservations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('property_reservations')
        .select('id, organization_id')
        .eq('guest_email', user.email)
        .order('check_in_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50">In Progress</Badge>;
      case 'resolved':
      case 'implemented':
        return <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-50">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priorityVal: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500 text-white hover:bg-red-500',
      high: 'bg-orange-500 text-white hover:bg-orange-500',
      medium: 'bg-yellow-500 text-black hover:bg-yellow-500',
      low: 'bg-blue-500 text-white hover:bg-blue-500',
    };
    return <Badge className={`text-[10px] px-2 py-0.5 rounded-full ${colors[priorityVal] || 'bg-muted'}`}>{priorityVal}</Badge>;
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const orgId = reservations.length > 0 ? reservations[0].organization_id : undefined;

      await createItemAsync({
        type: 'support',
        category,
        priority,
        subject,
        description,
        email: user.email || '',
        name: user.user_metadata?.first_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
          : 'Guest User',
        organization_id: orgId,
        user_id: user.id
      });

      // Reset form
      setSubject('');
      setDescription('');
      setCategory('maintenance');
      setPriority('medium');
      setIsOpen(false);
      refetch();
    } catch (err) {
      console.error('Error submitting request:', err);
      toast.error('Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow p-4 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Service Requests</h2>
          <p className="text-xs text-muted-foreground">Report and track maintenance requests</p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-10 px-4 text-xs font-semibold gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4 flex-grow flex flex-col justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-8 text-center flex-grow flex flex-col justify-center">
          <CardContent className="space-y-4 pt-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No active requests</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                If something in your property is broken or needs housekeeping attention, submit a new service request here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => (
            <Card key={item.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {item.category.replace(/_/g, ' ')}
                    </Badge>
                    {getPriorityBadge(item.priority)}
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {item.subject}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-zinc-800/50 text-[10px] text-muted-foreground">
                  <span>
                    Submitted: {format(new Date(item.created_at), 'MMM dd, yyyy')}
                  </span>
                  {item.ticket_number && (
                    <span className="font-mono">{item.ticket_number}</span>
                  )}
                </div>

                {item.resolution_notes && (
                  <div className="mt-2 p-2.5 rounded-xl bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30 text-xs">
                    <div className="flex items-center gap-1.5 text-green-800 dark:text-green-300 font-bold mb-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span>Host Resolution:</span>
                    </div>
                    <p className="text-green-700 dark:text-green-400 whitespace-pre-wrap">{item.resolution_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* The Drawer Rule Right-Side Form Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[100vw] sm:max-w-md p-0 flex flex-col h-full bg-white dark:bg-zinc-900 shadow-2xl">
          {/* Fixed Header */}
          <SheetHeader className="p-5 border-b text-left flex-shrink-0 flex items-center justify-between">
            <div>
              <SheetTitle className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-indigo-600" />
                Submit Service Request
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Report maintenance or cleaning issues</p>
            </div>
          </SheetHeader>

          {/* Scrollable Form Body */}
          <form onSubmit={handleCreateRequest} className="flex-grow overflow-y-auto p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Subject / Title
              </label>
              <Input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Broken coffee maker, Leaking bathroom tap"
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-semibold">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance" className="text-xs">🛠️ Maintenance</SelectItem>
                    <SelectItem value="housekeeping" className="text-xs">🧼 Housekeeping</SelectItem>
                    <SelectItem value="wifi_tech" className="text-xs">📡 Wi-Fi / Tech</SelectItem>
                    <SelectItem value="billing" className="text-xs">💳 Billing</SelectItem>
                    <SelectItem value="other" className="text-xs">💡 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Priority
                </label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-semibold">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="text-xs text-blue-600">🔵 Low</SelectItem>
                    <SelectItem value="medium" className="text-xs text-yellow-600">🟡 Medium</SelectItem>
                    <SelectItem value="high" className="text-xs text-orange-600">🟠 High</SelectItem>
                    <SelectItem value="critical" className="text-xs text-red-600">🔴 Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Detailed Description
              </label>
              <Textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail, including where it is located inside the property. This helps our team resolve it faster."
                rows={5}
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-600 text-sm leading-relaxed"
              />
            </div>

            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex gap-2.5">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
                If this is a severe water leak or security emergency, please contact us immediately via phone call at <a href="tel:+15412551698" className="font-bold underline">541-255-1698</a>.
              </p>
            </div>
            
            {/* Native submission trigger */}
            <button type="submit" className="hidden" id="mobile-ticket-submit-btn" />
          </form>

          {/* Fixed Footer */}
          <SheetFooter className="p-4 border-t flex flex-row items-center gap-2 justify-end bg-slate-50/80 dark:bg-zinc-900/80 backdrop-blur-sm flex-shrink-0">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 hover:bg-slate-100 dark:border-zinc-800 dark:hover:bg-zinc-800 flex-1 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 flex-1"
              disabled={isSubmitting}
              onClick={() => document.getElementById('mobile-ticket-submit-btn')?.click()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileRequests;
