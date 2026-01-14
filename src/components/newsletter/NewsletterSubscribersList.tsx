import React, { useState, useRef } from 'react';
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
  Upload,
  Mail, 
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter,
  Plus,
  Edit,
  Trash2,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedNewsletterSubscribers } from '@/hooks/useEnhancedNewsletterSubscribers';
import { useNewsletterSubscribersCRUD } from '@/hooks/useNewsletterSubscribersCRUD';
import MultiChannelStatsCards from '@/components/admin/newsletter/MultiChannelStatsCards';
import EnhancedSubscriberModal from '@/components/admin/newsletter/EnhancedSubscriberModal';
import AddSubscriberModal from '@/components/admin/newsletter/AddSubscriberModal';
import DeleteSubscriberModal from '@/components/admin/newsletter/DeleteSubscriberModal';
import { EnhancedSubscriber } from './types';

const NewsletterSubscribersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | 'email' | 'sms' | 'both'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<EnhancedSubscriber | null>(null);
  const [deletingSubscriber, setDeletingSubscriber] = useState<EnhancedSubscriber | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { 
    subscribers, 
    loading: isLoadingSubscribers, 
    error, 
    refetch,
    updateSubscriberCommunicationPrefs,
    getSubscriberStats
  } = useEnhancedNewsletterSubscribers();

  const { 
    addSubscriber, 
    editSubscriber, 
    deleteSubscriber, 
    isLoading, 
    deleting 
  } = useNewsletterSubscribersCRUD();

  const stats = getSubscriberStats();

  const filteredSubscribers = subscribers?.filter(subscriber => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      (subscriber.email?.toLowerCase() || '').includes(query) ||
      (subscriber.name?.toLowerCase() || '').includes(query) ||
      (subscriber.phone && subscriber.phone.includes(searchTerm));
    
    const matchesActiveFilter = 
      filterActive === 'all' || 
      (filterActive === 'active' && subscriber.is_active) ||
      (filterActive === 'inactive' && !subscriber.is_active);

    const matchesChannelFilter = 
      filterChannel === 'all' ||
      (filterChannel === 'email' && subscriber.email_opt_in && !subscriber.sms_opt_in) ||
      (filterChannel === 'sms' && subscriber.sms_opt_in && !subscriber.email_opt_in) ||
      (filterChannel === 'both' && subscriber.email_opt_in && subscriber.sms_opt_in);

    return matchesSearch && matchesActiveFilter && matchesChannelFilter;
  }) || [];

  // Import functionality
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected headers: email, name, phone (optional)
      const emailIndex = headers.findIndex(h => h.includes('email'));
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const phoneIndex = headers.findIndex(h => h.includes('phone'));
      
      if (emailIndex === -1) {
        throw new Error('CSV must contain an email column');
      }

      const importPromises = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const email = values[emailIndex]?.trim();
        const name = values[nameIndex]?.trim() || email.split('@')[0];
        const phone = phoneIndex >= 0 ? values[phoneIndex]?.trim() : '';
        
        if (!email || !email.includes('@')) {
          errorCount++;
          continue;
        }

        const subscriberData = {
          email,
          name,
          phone: phone || '',
          emailOptIn: true,
          smsOptIn: !!phone,
          communicationPreferences: {
            frequency: 'weekly' as const,
            preferredTime: 'morning' as const
          },
          contactSource: 'csv_import' as const
        };

        importPromises.push(
          addSubscriber(subscriberData).then(() => {
            successCount++;
          }).catch(() => {
            errorCount++;
          })
        );
      }

      await Promise.allSettled(importPromises);
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${successCount} subscribers. ${errorCount > 0 ? `${errorCount} errors.` : ''}`,
      });

      refetch();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Please check your CSV format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
      ['Email', 'Name', 'Phone', 'Status', 'Email Opt-in', 'SMS Opt-in', 'Contact Source', 'Frequency', 'Preferred Time', 'Subscribed Date'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.phone || '',
        sub.is_active ? 'Active' : 'Inactive',
        sub.email_opt_in ? 'Yes' : 'No',
        sub.sms_opt_in ? 'Yes' : 'No',
        sub.contact_source,
        sub.communication_preferences?.frequency || 'weekly',
        sub.communication_preferences?.preferred_time || 'morning',
        new Date(sub.subscribed_at).toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredSubscribers.length} contacts to CSV.`,
    });
  };

  const handleEditSubscriber = async (id: string, data: Partial<EnhancedSubscriber>) => {
    const success = await updateSubscriberCommunicationPrefs(id, data);
    if (success) {
      setEditingSubscriber(null);
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

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics */}
      <MultiChannelStatsCards stats={stats} loading={isLoadingSubscribers} />

      {/* Subscriber List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Contact Management
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
              <Button 
                onClick={handleImportClick} 
                variant="outline" 
                size="sm"
                disabled={isImporting}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import CSV'}
              </Button>
              <Button onClick={handleExportSubscribers} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Enhanced Search and Filter */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by email, name, or phone..."
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
                onChange={(e) => setFilterActive(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Channels</option>
                <option value="email">Email Only</option>
                <option value="sms">SMS Only</option>
                <option value="both">Both Channels</option>
              </select>
            </div>
          </div>

          {isLoadingSubscribers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading contacts...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No contacts found</p>
              <p className="text-sm">
                {searchTerm || filterActive !== 'all' || filterChannel !== 'all'
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No one has subscribed to your newsletter yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Communication Channels</TableHead>
                    <TableHead>Preferences</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{subscriber.email}</div>
                          {subscriber.name && (
                            <div className="text-sm text-gray-600">{subscriber.name}</div>
                          )}
                          {subscriber.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {subscriber.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {subscriber.email_opt_in && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Badge>
                          )}
                          {subscriber.sms_opt_in && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              SMS
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          <div>{subscriber.communication_preferences?.frequency || 'weekly'}</div>
                          <div className="text-xs">{subscriber.communication_preferences?.preferred_time || 'morning'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {subscriber.contact_source.replace('_', ' ')}
                        </Badge>
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
              Showing {filteredSubscribers.length} of {subscribers.length} contacts
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddSubscriberModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addSubscriber}
        isLoading={isLoading}
      />

      <EnhancedSubscriberModal
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
        onConfirm={deleteSubscriber}
        isDeleting={deleting === deletingSubscriber?.id}
      />
    </div>
  );
};

export default NewsletterSubscribersList;
