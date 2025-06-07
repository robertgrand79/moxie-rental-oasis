
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, Edit, MessageSquare } from 'lucide-react';
import { useContentApproval, ContentItem } from '@/hooks/useContentApproval';

const ContentApprovalWorkflow = () => {
  const { contentItems, loading, updateContentStatus } = useContentApproval();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [updating, setUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'needs_revision': return <Edit className="h-3 w-3" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog_post': return 'Blog Post';
      case 'property_description': return 'Property';
      case 'page_content': return 'Page Content';
      case 'ai_response': return 'AI Response';
      default: return type;
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'needs_revision') => {
    if (!selectedItem) return;

    setUpdating(true);
    try {
      const success = await updateContentStatus(selectedItem.id, status, feedback);
      if (success) {
        setSelectedItem(null);
        setFeedback('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredItems = contentItems.filter(item => {
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'approved') return item.status === 'approved';
    if (activeTab === 'rejected') return item.status === 'rejected';
    if (activeTab === 'revision') return item.status === 'needs_revision';
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Content Approval Workflow</h2>
        <p className="text-gray-600 mt-1">Review and approve AI-generated content before publication</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">
            Pending ({contentItems.filter(i => i.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({contentItems.filter(i => i.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({contentItems.filter(i => i.status === 'rejected').length})
          </TabsTrigger>
          <TabsTrigger value="revision">
            Needs Revision ({contentItems.filter(i => i.status === 'needs_revision').length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({contentItems.length})</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Content Items</CardTitle>
                <CardDescription>
                  {filteredItems.length} items to review
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2 p-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedItem?.id === item.id 
                            ? 'bg-blue-50 border-blue-200 border' 
                            : 'hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(item.type)}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {item.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>By {item.created_by}</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No content items found for this filter
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Content Review Panel */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Eye className="h-5 w-5 mr-2" />
                        {selectedItem.title}
                      </CardTitle>
                      <CardDescription>
                        {getTypeLabel(selectedItem.type)} • Created by {selectedItem.created_by}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedItem.status)}>
                      {getStatusIcon(selectedItem.status)}
                      {selectedItem.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedItem.original_prompt && (
                    <div>
                      <h4 className="font-medium mb-2">Original Prompt</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedItem.original_prompt}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Generated Content</h4>
                    <div className="p-4 border rounded-lg max-h-60 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{selectedItem.content}</p>
                    </div>
                  </div>

                  {selectedItem.feedback && (
                    <div>
                      <h4 className="font-medium mb-2">Previous Feedback</h4>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">{selectedItem.feedback}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.status === 'pending' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Review Feedback</label>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Add feedback for the content creator..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleStatusUpdate('approved')} 
                          className="flex-1"
                          disabled={updating}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate('needs_revision')} 
                          variant="outline" 
                          className="flex-1"
                          disabled={updating}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Request Revision
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate('rejected')} 
                          variant="destructive" 
                          className="flex-1"
                          disabled={updating}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedItem.reviewed_at && (
                    <div className="text-xs text-gray-500 pt-4 border-t">
                      Reviewed by {selectedItem.reviewed_by} on {new Date(selectedItem.reviewed_at).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent>
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Selected</h3>
                    <p className="text-gray-600">Select a content item to review and approve</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default ContentApprovalWorkflow;
