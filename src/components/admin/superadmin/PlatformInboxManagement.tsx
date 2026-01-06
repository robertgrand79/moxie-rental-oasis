import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Inbox,
  Ticket,
  Lightbulb,
  Bug,
  MessageSquare,
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building2,
  User,
  Filter,
  RefreshCw,
  Archive,
  Trash2,
  MoreHorizontal,
  ArrowRightLeft,
  ThumbsUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { usePlatformInbox, PlatformInboxItem, InboxStatus, InboxPriority, InboxType } from '@/hooks/usePlatformInbox';

type Organization = {
  id: string;
  name: string;
  slug: string;
};

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  support: { icon: Ticket, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Support' },
  feedback: { icon: Lightbulb, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', label: 'Feedback' },
};

const categoryIcons: Record<string, React.ElementType> = {
  bug_report: Bug,
  bug: Bug,
  feature_request: Lightbulb,
  technical: AlertCircle,
  billing: Ticket,
  general: MessageSquare,
  improvement: Lightbulb,
};

const statusColors: Record<string, string> = {
  open: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  planned: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
  implemented: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/10 text-yellow-600',
  high: 'bg-orange-500/10 text-orange-600',
  critical: 'bg-destructive/10 text-destructive',
};

const PlatformInboxManagement = () => {
  const queryClient = useQueryClient();
  const { items, isLoading, refetch, updateItem, deleteItem, convertType, getCounts } = usePlatformInbox();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlatformInboxItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<PlatformInboxItem | null>(null);

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

  const getOrganizationName = (orgId: string | null) => {
    if (!orgId) return 'No organization';
    const org = organizations?.find(o => o.id === orgId);
    return org?.name || 'Unknown';
  };

  const handleStatusChange = (itemId: string, newStatus: InboxStatus) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'resolved' || newStatus === 'implemented') {
      updates.resolved_at = new Date().toISOString();
    }
    updateItem({ itemId, updates });
  };

  const handlePriorityChange = (itemId: string, newPriority: InboxPriority) => {
    updateItem({ itemId, updates: { priority: newPriority } });
  };

  const handleSaveAdminNotes = () => {
    if (!selectedItem) return;
    updateItem({ itemId: selectedItem.id, updates: { admin_notes: adminNotes } });
  };

  const handleArchive = (item: PlatformInboxItem) => {
    updateItem({
      itemId: item.id,
      updates: { 
        is_archived: !item.is_archived,
        archived_at: item.is_archived ? null : new Date().toISOString()
      },
    });
  };

  const handleConvert = (item: PlatformInboxItem) => {
    const newType: InboxType = item.type === 'support' ? 'feedback' : 'support';
    convertType({ itemId: item.id, newType });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteItem(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  // Filter items
  const filteredItems = items?.filter(item => {
    const matchesSearch = 
      (item.ticket_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesArchived = showArchived ? item.is_archived : !item.is_archived;
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesArchived;
  }) || [];

  const counts = getCounts(items);

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Support</CardTitle>
            <Ticket className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{counts.support}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            <Lightbulb className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{counts.feedback}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{counts.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{counts.inProgress}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Inbox</CardTitle>
              <CardDescription>Manage support tickets and user feedback</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Type Tabs */}
          <Tabs value={typeFilter} onValueChange={setTypeFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All ({counts.total})</TabsTrigger>
              <TabsTrigger value="support">
                <Ticket className="h-3 w-3 mr-1" />
                Support ({counts.support})
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <Lightbulb className="h-3 w-3 mr-1" />
                Feedback ({counts.feedback})
              </TabsTrigger>
            </TabsList>
          </Tabs>

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
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="implemented">Implemented</SelectItem>
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
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant={showArchived ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? 'Showing Archived' : 'Show Archived'}
            </Button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No items found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>ID/Subject</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const TypeIcon = typeConfig[item.type]?.icon || Inbox;
                    const CategoryIcon = categoryIcons[item.category] || MessageSquare;
                    
                    return (
                      <TableRow 
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedItem(item);
                          setAdminNotes(item.admin_notes || '');
                        }}
                      >
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 w-fit ${typeConfig[item.type]?.color}`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig[item.type]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {item.ticket_number && (
                              <span className="font-mono text-xs text-muted-foreground">
                                {item.ticket_number}
                              </span>
                            )}
                            <span className="font-medium max-w-[200px] truncate">
                              {item.subject}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CategoryIcon className="h-3 w-3" />
                              {item.category.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm">{item.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">{item.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getOrganizationName(item.organization_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select 
                            value={item.priority} 
                            onValueChange={(value) => handlePriorityChange(item.id, value as InboxPriority)}
                          >
                            <SelectTrigger className={`w-[100px] h-7 ${priorityColors[item.priority]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select 
                            value={item.status} 
                            onValueChange={(value) => handleStatusChange(item.id, value as InboxStatus)}
                          >
                            <SelectTrigger className={`w-[130px] h-7 ${statusColors[item.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="implemented">Implemented</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {item.type === 'feedback' && (
                              <div className="flex items-center gap-1 mr-2 text-sm text-muted-foreground">
                                <ThumbsUp className="h-3 w-3" />
                                {item.votes || 0}
                              </div>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleConvert(item)}>
                                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                                  Convert to {item.type === 'support' ? 'Feedback' : 'Support'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleArchive(item)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  {item.is_archived ? 'Unarchive' : 'Archive'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => setDeleteConfirm(item)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedItem.ticket_number && (
                    <span className="font-mono text-sm text-muted-foreground">
                      {selectedItem.ticket_number}
                    </span>
                  )}
                  <Badge variant="outline" className={typeConfig[selectedItem.type]?.color}>
                    {typeConfig[selectedItem.type]?.label}
                  </Badge>
                  <Badge variant="outline" className={statusColors[selectedItem.status]}>
                    {formatStatus(selectedItem.status)}
                  </Badge>
                  <Badge variant="outline" className={priorityColors[selectedItem.priority]}>
                    {selectedItem.priority}
                  </Badge>
                </div>
                <DialogTitle>{selectedItem.subject}</DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date(selectedItem.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                  {selectedItem.email && ` by ${selectedItem.email}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-md">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 capitalize">{selectedItem.category.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="ml-2">{getOrganizationName(selectedItem.organization_id)}</span>
                  </div>
                  {selectedItem.type === 'feedback' && (
                    <div>
                      <span className="text-muted-foreground">Votes:</span>
                      <span className="ml-2">{selectedItem.votes || 0}</span>
                    </div>
                  )}
                </div>

                {selectedItem.resolution_notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Resolution Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {selectedItem.resolution_notes}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Admin Notes</h4>
                  <Textarea 
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes (not visible to user)..."
                    rows={3}
                  />
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={handleSaveAdminNotes}
                    disabled={adminNotes === (selectedItem.admin_notes || '')}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.subject}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlatformInboxManagement;
