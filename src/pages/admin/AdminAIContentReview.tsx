
import React, { useState } from 'react';
import { Eye, Check, X, Edit, Trash2, Wand2, FileText, Mail } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminAIContentReview = () => {
  const [generatedContent] = useState([
    {
      id: 1,
      type: 'Blog Post',
      title: 'Top 10 Things to Do in Eugene This Summer',
      generatedAt: '2024-01-15 14:30',
      status: 'Pending Review',
      content: 'Eugene offers amazing summer activities...',
      prompt: 'Write a blog post about summer activities in Eugene'
    },
    {
      id: 2,
      type: 'Newsletter',
      title: 'Weekly Property Update Newsletter',
      generatedAt: '2024-01-14 09:15',
      status: 'Approved',
      content: 'Check out our latest property additions...',
      prompt: 'Create a newsletter about new properties'
    },
    {
      id: 3,
      type: 'Property Description',
      title: 'Downtown Loft Description',
      generatedAt: '2024-01-13 16:45',
      status: 'Draft',
      content: 'This stunning downtown loft features...',
      prompt: 'Generate description for 2BR downtown loft'
    },
    {
      id: 4,
      type: 'Meta Description',
      title: 'About Page SEO Description',
      generatedAt: '2024-01-12 11:20',
      status: 'Rejected',
      content: 'Learn about Moxie Travel Eugene...',
      prompt: 'Create SEO meta description for about page'
    }
  ]);

  const handleApprove = (id: number) => {
    console.log('Approve content:', id);
  };

  const handleReject = (id: number) => {
    console.log('Reject content:', id);
  };

  const handleEdit = (id: number) => {
    console.log('Edit content:', id);
  };

  const handleView = (id: number) => {
    console.log('View content:', id);
  };

  const handleDelete = (id: number) => {
    console.log('Delete content:', id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review':
        return 'destructive';
      case 'Approved':
        return 'default';
      case 'Draft':
        return 'secondary';
      case 'Rejected':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Blog Post':
        return <FileText className="h-4 w-4" />;
      case 'Newsletter':
        return <Mail className="h-4 w-4" />;
      default:
        return <Wand2 className="h-4 w-4" />;
    }
  };

  return (
    <AdminPageWrapper
      title="AI Generated Content"
      description="Review, approve, and manage all AI-generated content"
    >
      <div className="p-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="all">All Content</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Content Awaiting Review</CardTitle>
                <CardDescription>
                  AI-generated content that needs your approval before publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedContent
                      .filter(item => item.status === 'Pending Review')
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              {item.type}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{item.generatedAt}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(item.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(item.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Content</CardTitle>
                <CardDescription>
                  AI-generated content that has been approved and published
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedContent
                      .filter(item => item.status === 'Approved')
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              {item.type}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{item.generatedAt}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(item.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts">
            <Card>
              <CardHeader>
                <CardTitle>Draft Content</CardTitle>
                <CardDescription>
                  AI-generated content saved as drafts for later review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedContent
                      .filter(item => item.status === 'Draft')
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              {item.type}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{item.generatedAt}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(item.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Generated Content</CardTitle>
                <CardDescription>
                  Complete history of all AI-generated content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            {item.type}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.generatedAt}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(item.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {item.status === 'Pending Review' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(item.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {item.status === 'Approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {item.status === 'Draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminAIContentReview;
