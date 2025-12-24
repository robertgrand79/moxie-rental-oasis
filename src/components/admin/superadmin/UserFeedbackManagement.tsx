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
  MessageSquare, 
  Bug, 
  Lightbulb, 
  HelpCircle,
  ThumbsUp,
  Filter,
  RefreshCw,
  Building2,
  Archive,
  Trash2,
  MoreHorizontal
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

type UserFeedback = {
  id: string;
  title: string;
  description: string;
  feedback_type: string;
  status: string;
  priority: string | null;
  votes: number | null;
  admin_notes: string | null;
  organization_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  archived_at: string | null;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
};

const typeIcons: Record<string, React.ElementType> = {
  bug: Bug,
  feature_request: Lightbulb,
  suggestion: ThumbsUp,
  general: HelpCircle,
};

const typeColors: Record<string, string> = {
  bug: 'bg-destructive/10 text-destructive border-destructive/20',
  feature_request: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  suggestion: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  general: 'bg-muted text-muted-foreground border-border',
};

const statusColors: Record<string, string> = {
  submitted: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  new: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  under_review: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  planned: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  in_progress: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  implemented: 'bg-green-500/10 text-green-600 border-green-500/20',
  declined: 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/10 text-yellow-600',
  high: 'bg-orange-500/10 text-orange-600',
  critical: 'bg-destructive/10 text-destructive',
};

const UserFeedbackManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<UserFeedback | null>(null);

  // Fetch all feedback
  const { data: feedback, isLoading, refetch } = useQuery({
    queryKey: ['platform-user-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserFeedback[];
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

  // Update feedback mutation
  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ 
      feedbackId, 
      updates 
    }: { 
      feedbackId: string; 
      updates: Partial<UserFeedback> 
    }) => {
      const { error } = await supabase
        .from('user_feedback')
        .update(updates)
        .eq('id', feedbackId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-user-feedback'] });
      toast.success('Feedback updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update feedback: ' + error.message);
    },
  });

  // Delete feedback mutation
  const deleteFeedbackMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      const { error } = await supabase
        .from('user_feedback')
        .delete()
        .eq('id', feedbackId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-user-feedback'] });
      toast.success('Feedback deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Failed to delete feedback: ' + error.message);
    },
  });

  const getOrganizationName = (orgId: string | null) => {
    if (!orgId) return 'No organization';
    const org = organizations?.find(o => o.id === orgId);
    return org?.name || 'Unknown';
  };

  const handleStatusChange = (feedbackId: string, newStatus: string) => {
    updateFeedbackMutation.mutate({ 
      feedbackId, 
      updates: { status: newStatus } 
    });
  };

  const handlePriorityChange = (feedbackId: string, newPriority: string) => {
    updateFeedbackMutation.mutate({ 
      feedbackId, 
      updates: { priority: newPriority } 
    });
  };

  const handleSaveAdminNotes = () => {
    if (!selectedFeedback) return;
    updateFeedbackMutation.mutate({
      feedbackId: selectedFeedback.id,
      updates: { admin_notes: adminNotes },
    });
  };

  const handleArchive = (item: UserFeedback) => {
    updateFeedbackMutation.mutate({
      feedbackId: item.id,
      updates: { 
        is_archived: !item.is_archived,
        archived_at: item.is_archived ? null : new Date().toISOString()
      },
    });
  };

  // Filter feedback
  const filteredFeedback = feedback?.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.feedback_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesArchived = showArchived ? item.is_archived : !item.is_archived;
    return matchesSearch && matchesType && matchesStatus && matchesArchived;
  }) || [];

  // Stats
  const stats = {
    total: feedback?.length || 0,
    bugs: feedback?.filter(f => f.feedback_type === 'bug').length || 0,
    features: feedback?.filter(f => f.feedback_type === 'feature_request').length || 0,
    new: feedback?.filter(f => f.status === 'new').length || 0,
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bug Reports</CardTitle>
            <Bug className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.bugs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Feature Requests</CardTitle>
            <Lightbulb className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.features}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New/Unreviewed</CardTitle>
            <HelpCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.new}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>Manage all user feedback submissions</CardDescription>
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
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="implemented">Implemented</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
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

          {/* Feedback Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading feedback...</div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No feedback found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((item) => {
                    const TypeIcon = typeIcons[item.feedback_type] || HelpCircle;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 w-fit ${typeColors[item.feedback_type]}`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {formatType(item.feedback_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate font-medium">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getOrganizationName(item.organization_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.priority || 'medium'} 
                            onValueChange={(value) => handlePriorityChange(item.id, value)}
                          >
                            <SelectTrigger className={`w-[100px] h-7 ${priorityColors[item.priority || 'medium']}`}>
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
                        <TableCell>
                          <Select 
                            value={item.status} 
                            onValueChange={(value) => handleStatusChange(item.id, value)}
                          >
                            <SelectTrigger className={`w-[130px] h-7 ${statusColors[item.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="implemented">Implemented</SelectItem>
                              <SelectItem value="declined">Declined</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{item.votes || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedFeedback(item);
                                setAdminNotes(item.admin_notes || '');
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
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

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeedback && (
                <>
                  {React.createElement(typeIcons[selectedFeedback.feedback_type] || HelpCircle, { className: "h-5 w-5" })}
                  {formatType(selectedFeedback.feedback_type)}
                </>
              )}
            </DialogTitle>
            <DialogDescription>{selectedFeedback?.title}</DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Organization</label>
                  <p className="text-sm text-muted-foreground">
                    {getOrganizationName(selectedFeedback.organization_id)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedFeedback.created_at), 'PPpp')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant="outline" className={statusColors[selectedFeedback.status]}>
                    {formatStatus(selectedFeedback.status)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Votes</label>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {selectedFeedback.votes || 0}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                  {selectedFeedback.description}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this feedback..."
                  className="mt-1"
                  rows={4}
                />
                <Button 
                  className="mt-2" 
                  size="sm"
                  onClick={handleSaveAdminNotes}
                  disabled={updateFeedbackMutation.isPending}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this feedback: "{deleteConfirm?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && deleteFeedbackMutation.mutate(deleteConfirm.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserFeedbackManagement;
