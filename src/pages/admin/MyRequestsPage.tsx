import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Ticket,
  Lightbulb,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Inbox,
} from 'lucide-react';
import { format } from 'date-fns';
import SupportTicketForm from '@/components/support/SupportTicketForm';
import FeedbackForm from '@/components/support/FeedbackForm';
import { usePlatformInbox, PlatformInboxItem } from '@/hooks/usePlatformInbox';

const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { useUserInboxItems } = usePlatformInbox();
  const { data: items, isLoading } = useUserInboxItems(user?.id);
  
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showNewFeedback, setShowNewFeedback] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlatformInboxItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; color?: string }> = {
      open: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      in_progress: { variant: 'default', icon: <MessageSquare className="h-3 w-3" /> },
      planned: { variant: 'outline', icon: <Clock className="h-3 w-3" />, color: 'text-purple-600' },
      resolved: { variant: 'outline', icon: <CheckCircle2 className="h-3 w-3 text-green-500" /> },
      implemented: { variant: 'outline', icon: <CheckCircle2 className="h-3 w-3 text-green-500" /> },
      closed: { variant: 'secondary', icon: <CheckCircle2 className="h-3 w-3" /> },
    };

    const config = variants[status] || variants.open;
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color || ''}`}>
        {config.icon}
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-blue-500 text-white',
    };

    return (
      <Badge className={colors[priority] || 'bg-muted'}>
        {priority}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    if (type === 'support') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20">
          <Ticket className="h-3 w-3" />
          Support
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-purple-500/10 text-purple-600 border-purple-500/20">
        <Lightbulb className="h-3 w-3" />
        Feedback
      </Badge>
    );
  };

  const filteredItems = items?.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ticket_number?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const supportCount = items?.filter(i => i.type === 'support').length || 0;
  const feedbackCount = items?.filter(i => i.type === 'feedback').length || 0;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-muted-foreground">View your support tickets and feedback submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewFeedback(true)}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Feedback
          </Button>
          <Button onClick={() => setShowNewTicket(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Type Tabs */}
      <Tabs value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({items?.length || 0})</TabsTrigger>
          <TabsTrigger value="support">
            <Ticket className="h-3 w-3 mr-1" />
            Support ({supportCount})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <Lightbulb className="h-3 w-3 mr-1" />
            Feedback ({feedbackCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
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
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-4">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(item.type)}
                      {item.ticket_number && (
                        <span className="font-mono text-sm text-muted-foreground">
                          {item.ticket_number}
                        </span>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {item.category.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-medium">{item.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No requests found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't submitted any requests yet"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setShowNewFeedback(true)}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
              <Button onClick={() => setShowNewTicket(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll get back to you as soon as possible
            </DialogDescription>
          </DialogHeader>
          <SupportTicketForm onSuccess={() => setShowNewTicket(false)} />
        </DialogContent>
      </Dialog>

      {/* New Feedback Dialog */}
      <Dialog open={showNewFeedback} onOpenChange={setShowNewFeedback}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Share your ideas, report bugs, or suggest improvements
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm onSuccess={() => setShowNewFeedback(false)} />
        </DialogContent>
      </Dialog>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getTypeBadge(selectedItem.type)}
                  {selectedItem.ticket_number && (
                    <span className="font-mono text-sm text-muted-foreground">
                      {selectedItem.ticket_number}
                    </span>
                  )}
                  {getStatusBadge(selectedItem.status)}
                  {getPriorityBadge(selectedItem.priority)}
                </div>
                <DialogTitle>{selectedItem.subject}</DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date(selectedItem.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
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
                  {selectedItem.email && (
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2">{selectedItem.email}</span>
                    </div>
                  )}
                </div>

                {selectedItem.resolution_notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Resolution</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-900">
                      {selectedItem.resolution_notes}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRequestsPage;
