
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNewsletterSubscribersCRUD } from '@/hooks/useNewsletterSubscribersCRUD';
import AddSubscriberModal from '@/components/admin/newsletter/AddSubscriberModal';
import EditSubscriberModal from '@/components/admin/newsletter/EditSubscriberModal';
import DeleteSubscriberModal from '@/components/admin/newsletter/DeleteSubscriberModal';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
  preferences: any;
}

const NewsletterSubscribersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [deletingSubscriber, setDeletingSubscriber] = useState<Subscriber | null>(null);
  const { toast } = useToast();

  const { 
    addSubscriber, 
    editSubscriber, 
    deleteSubscriber, 
    isLoading, 
    deleting 
  } = useNewsletterSubscribersCRUD();

  const { data: subscribers, isLoading: isLoadingSubscribers, error, refetch } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const filteredSubscribers = subscribers?.filter(subscriber => {
    const matchesSearch = 
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterActive === 'all' || 
      (filterActive === 'active' && subscriber.is_active) ||
      (filterActive === 'inactive' && !subscriber.is_active);

    return matchesSearch && matchesFilter;
  }) || [];

  const handleExportSubscribers = () => {
    if (!subscribers || subscribers.length === 0) {
      toast({
        title: "No Data",
        description: "No subscribers to export.",
        variant: "destructive",
      });
      return;
    }

    const csvData = [
      ['Email', 'Name', 'Status', 'Subscribed Date'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.is_active ? 'Active' : 'Inactive',
        new Date(sub.subscribed_at).toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredSubscribers.length} subscribers to CSV.`,
    });
  };

  const handleToggleStatus = async (subscriberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: !currentStatus })
        .eq('id', subscriberId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Subscriber ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      refetch();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update subscriber status.",
        variant: "destructive",
      });
    }
  };

  const handleAddSubscriber = async (data: { email: string; name: string; is_active: boolean }) => {
    const success = await addSubscriber(data);
    if (success) {
      setShowAddModal(false);
      refetch();
    }
  };

  const handleEditSubscriber = async (id: string, data: { email: string; name: string; is_active: boolean }) => {
    const success = await editSubscriber(id, data);
    if (success) {
      setEditingSubscriber(null);
      refetch();
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    const success = await deleteSubscriber(id);
    if (success) {
      setDeletingSubscriber(null);
      refetch();
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load subscribers. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const activeCount = subscribers?.filter(s => s.is_active).length || 0;
  const totalCount = subscribers?.length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              All newsletter subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently receiving newsletters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Subscribers</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalCount - activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Unsubscribed or inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriber List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Newsletter Subscribers
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
              <Button onClick={handleExportSubscribers} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {isLoadingSubscribers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading subscribers...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No subscribers found</p>
              <p className="text-sm">
                {searchTerm || filterActive !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No one has subscribed to your newsletter yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">
                        {subscriber.email}
                      </TableCell>
                      <TableCell>
                        {subscriber.name || (
                          <span className="text-gray-400 italic">No name</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={subscriber.is_active ? "default" : "secondary"}
                          className={subscriber.is_active ? "bg-green-100 text-green-800" : ""}
                        >
                          {subscriber.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSubscriber(subscriber)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(subscriber.id, subscriber.is_active)}
                          >
                            {subscriber.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSubscriber(subscriber)}
                            disabled={deleting === subscriber.id}
                          >
                            {deleting === subscriber.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredSubscribers.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredSubscribers.length} of {totalCount} subscribers
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddSubscriberModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubscriber}
        isLoading={isLoading}
      />

      <EditSubscriberModal
        subscriber={editingSubscriber}
        open={!!editingSubscriber}
        onClose={() => setEditingSubscriber(null)}
        onSubmit={handleEditSubscriber}
        isLoading={isLoading}
      />

      <DeleteSubscriberModal
        subscriber={deletingSubscriber}
        open={!!deletingSubscriber}
        onClose={() => setDeletingSubscriber(null)}
        onConfirm={handleDeleteSubscriber}
        isDeleting={deleting === deletingSubscriber?.id}
      />
    </div>
  );
};

export default NewsletterSubscribersList;
