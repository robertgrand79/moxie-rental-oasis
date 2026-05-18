import React, { useState } from 'react';
import { Mail, Eye, Edit, Trash2, MoreVertical, Copy, Users, Calendar, Files, X, RotateCw } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import NewsletterPreviewModal from './NewsletterPreviewModal';
import NewsletterDeleteModal from './NewsletterDeleteModal';
import { NewsletterCampaign, NewsletterListViewProps } from './types';

const NewslettersListView = ({ newsletters, onEdit, onDelete, onDuplicate, onCancelSchedule, onRetry, onCreateNew, onView, deleting, duplicating }: NewsletterListViewProps) => {
  const [previewNewsletter, setPreviewNewsletter] = useState<NewsletterCampaign | null>(null);
  const [deleteNewsletter, setDeleteNewsletter] = useState<NewsletterCampaign | null>(null);

  const handleView = (newsletter: NewsletterCampaign) => {
    console.log('handleView called with:', newsletter);
    if (onView) {
      onView(newsletter);
    } else {
      setPreviewNewsletter(newsletter);
    }
  };

  const handleDeleteClick = (newsletter: NewsletterCampaign) => {
    setDeleteNewsletter(newsletter);
  };

  const handleDeleteConfirm = () => {
    if (deleteNewsletter) {
      onDelete(deleteNewsletter.id);
      setDeleteNewsletter(null);
    }
  };

  const handleCopyId = (newsletter: NewsletterCampaign) => {
    navigator.clipboard.writeText(newsletter.id);
    toast({
      title: "Copied",
      description: "Newsletter ID copied to clipboard",
    });
  };

  const getStatus = (n: NewsletterCampaign): 'sent' | 'scheduled' | 'failed' | 'draft' => {
    if (n.sent_at) return 'sent';
    if (n.scheduled_at && new Date(n.scheduled_at).getTime() > Date.now()) return 'scheduled';
    if (n.send_failure_reason && !n.scheduled_at) return 'failed';
    return 'draft';
  };
  const getStatusColor = (status: 'sent' | 'scheduled' | 'failed' | 'draft') => {
    if (status === 'sent') return 'bg-green-500';
    if (status === 'scheduled') return 'bg-blue-500';
    if (status === 'failed') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  if (newsletters.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No newsletters found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first newsletter campaign.
        </p>
        <Button onClick={onCreateNew}>
          <Mail className="h-4 w-4 mr-2" />
          Create Newsletter
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Cover</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newsletters.map((newsletter) => {
              const status = getStatus(newsletter);
              const isSent = status === 'sent';
              const isScheduled = status === 'scheduled';
              const isFailed = status === 'failed';

              return (
                <TableRow key={newsletter.id}>
                  {/* Status Indicator */}
                  <TableCell className="w-2 p-0">
                    <div className={`w-1 h-full min-h-[60px] ${getStatusColor(status)}`} />
                  </TableCell>
                  
                  {/* Cover Image */}
                  <TableCell className="w-16">
                    {newsletter.cover_image_url ? (
                      <img
                        src={newsletter.cover_image_url}
                        alt={newsletter.subject}
                        className="w-12 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Subject */}
                  <TableCell className="font-medium max-w-xs">
                    <div 
                      className="truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleView(newsletter)}
                    >
                      {newsletter.subject}
                    </div>
                  </TableCell>
                  
                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      variant="default"
                      className={
                        isSent ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : isScheduled ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : isFailed ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }
                    >
                      {isSent ? "Sent" : isScheduled ? "Scheduled" : isFailed ? "Failed" : "Draft"}
                    </Badge>
                    {isFailed && newsletter.send_failure_reason && (
                      <p className="text-xs text-red-700 mt-1 max-w-[260px] truncate" title={newsletter.send_failure_reason}>
                        {newsletter.send_failure_reason}
                      </p>
                    )}
                  </TableCell>
                  
                  {/* Recipients */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {newsletter.recipient_count}
                    </div>
                  </TableCell>
                  
                  {/* Date */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {isSent 
                        ? new Date(newsletter.sent_at!).toLocaleDateString()
                        : new Date(newsletter.created_at).toLocaleDateString()
                      }
                    </div>
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(newsletter)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview newsletter content</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyId(newsletter)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy newsletter ID</TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-popover">
                          <DropdownMenuItem onSelect={() => handleView(newsletter)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {!isSent && (
                            <DropdownMenuItem onSelect={() => onEdit(newsletter)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {isScheduled && onCancelSchedule && (
                            <DropdownMenuItem onSelect={() => onCancelSchedule(newsletter)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel Schedule
                            </DropdownMenuItem>
                          )}
                          {isFailed && onRetry && (
                            <DropdownMenuItem onSelect={() => onRetry(newsletter)}>
                              <RotateCw className="h-4 w-4 mr-2" />
                              Retry Send
                            </DropdownMenuItem>
                          )}
                          {onDuplicate && (
                            <DropdownMenuItem
                              onSelect={() => onDuplicate(newsletter)}
                              disabled={duplicating === newsletter.id}
                            >
                              <Files className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleDeleteClick(newsletter)}
                            className="text-destructive focus:text-destructive"
                            disabled={deleting === newsletter.id}
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

      {/* Preview Modal */}
      <NewsletterPreviewModal
        campaign={previewNewsletter}
        open={!!previewNewsletter}
        onClose={() => setPreviewNewsletter(null)}
      />

      {/* Delete Confirmation Modal */}
      <NewsletterDeleteModal
        campaign={deleteNewsletter}
        open={!!deleteNewsletter}
        onClose={() => setDeleteNewsletter(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleting === deleteNewsletter?.id}
      />
    </TooltipProvider>
  );
};

export default NewslettersListView;
