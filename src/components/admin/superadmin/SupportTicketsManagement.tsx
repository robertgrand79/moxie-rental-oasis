import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Ticket, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  Building2,
  User,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type SupportTicket = {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  email: string;
  name: string | null;
  organization_id: string | null;
  user_id: string | null;
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  attachments: string[] | null;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
};

const statusColors: Record<string, string> = {
  open: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  waiting_customer: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/10 text-yellow-600',
  high: 'bg-orange-500/10 text-orange-600',
  urgent: 'bg-destructive/10 text-destructive',
};

const SupportTicketsManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Fetch all tickets
  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['platform-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SupportTicket[];
    },
  });

  // Fetch organizations for reference
  const { data: organizations } = useQuery({
    queryKey: ['platform-organizations-lookup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug');
      
      if (error) throw error;
      return data as Organization[];
    },
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ 
      ticketId, 
      updates 
    }: { 
      ticketId: string; 
      updates: Partial<SupportTicket> 
    }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-support-tickets'] });
      toast.success('Ticket updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update ticket: ' + error.message);
    },
  });

  const getOrganizationName = (orgId: string | null) => {
    if (!orgId) return 'No organization';
    const org = organizations?.find(o => o.id === orgId);
    return org?.name || 'Unknown';
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    const updates: Partial<SupportTicket> = { status: newStatus };
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }
    updateTicketMutation.mutate({ ticketId, updates });
  };

  const handlePriorityChange = (ticketId: string, newPriority: string) => {
    updateTicketMutation.mutate({ 
      ticketId, 
      updates: { priority: newPriority } 
    });
  };

  const handleSaveResolution = () => {
    if (!selectedTicket) return;
    updateTicketMutation.mutate({
      ticketId: selectedTicket.id,
      updates: { resolution_notes: resolutionNotes },
    });
  };

  // Filter tickets
  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  // Stats
  const stats = {
    total: tickets?.length || 0,
    open: tickets?.filter(t => t.status === 'open').length || 0,
    inProgress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage all platform support tickets</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket #, subject, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_customer">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No tickets found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">
                        {ticket.ticket_number}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">{ticket.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{ticket.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getOrganizationName(ticket.organization_id)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={ticket.priority} 
                          onValueChange={(value) => handlePriorityChange(ticket.id, value)}
                        >
                          <SelectTrigger className={`w-[100px] h-7 ${priorityColors[ticket.priority]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={ticket.status} 
                          onValueChange={(value) => handleStatusChange(ticket.id, value)}
                        >
                          <SelectTrigger className={`w-[130px] h-7 ${statusColors[ticket.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="waiting_customer">Waiting</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setResolutionNotes(ticket.resolution_notes || '');
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket {selectedTicket?.ticket_number}
            </DialogTitle>
            <DialogDescription>{selectedTicket?.subject}</DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Requester</label>
                  <p className="text-sm text-muted-foreground">{selectedTicket.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{selectedTicket.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Organization</label>
                  <p className="text-sm text-muted-foreground">
                    {getOrganizationName(selectedTicket.organization_id)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Badge variant="outline">{selectedTicket.category}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedTicket.created_at), 'PPpp')}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add internal notes about the resolution..."
                  className="mt-1"
                  rows={4}
                />
                <Button 
                  className="mt-2" 
                  size="sm"
                  onClick={handleSaveResolution}
                  disabled={updateTicketMutation.isPending}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTicketsManagement;
