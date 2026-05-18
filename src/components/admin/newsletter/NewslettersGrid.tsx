import React, { useState } from 'react';
import { Mail, Eye, Edit, Trash2, Users, Calendar, Send, MoreVertical, Copy, Files, X, RotateCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { NewsletterCampaign, NewsletterGridProps } from './types';

const NewslettersGrid = ({ newsletters, onEdit, onDelete, onDuplicate, onCancelSchedule, onRetry, onCreateNew, onView, deleting, duplicating }: NewsletterGridProps) => {
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

  const truncateContent = (content: string, maxLength: number = 100) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  // Four status colors: sent (green), scheduled (blue), failed (red), draft (yellow).
  // A campaign with send_failure_reason set and no scheduled_at means the cron
  // worker tried MAX_ATTEMPTS times and gave up — we surface that as a Failed
  // terminal state with a Retry action, rather than leaving it indefinitely
  // listed as "Draft" with mysterious failure context buried in the DB.
  const getStatusColor = (status: 'sent' | 'scheduled' | 'failed' | 'draft') => {
    if (status === 'sent') return 'bg-green-500';
    if (status === 'scheduled') return 'bg-blue-500';
    if (status === 'failed') return 'bg-red-500';
    return 'bg-yellow-500';
  };
  const getStatus = (n: NewsletterCampaign): 'sent' | 'scheduled' | 'failed' | 'draft' => {
    if (n.sent_at) return 'sent';
    if (n.scheduled_at && new Date(n.scheduled_at).getTime() > Date.now()) return 'scheduled';
    if (n.send_failure_reason && !n.scheduled_at) return 'failed';
    return 'draft';
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
          <Send className="h-4 w-4 mr-2" />
          Create Newsletter
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {newsletters.map((newsletter) => {
          const status = getStatus(newsletter);
          const isSent = status === 'sent';
          const isScheduled = status === 'scheduled';
          const isFailed = status === 'failed';
          const statusLabel = isSent ? 'Sent' : isScheduled ? 'Scheduled' : isFailed ? 'Failed' : 'Draft';
          const statusBadgeClass = isSent
            ? 'bg-green-100 text-green-800 hover:bg-green-100'
            : isScheduled
            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
            : isFailed
            ? 'bg-red-100 text-red-800 hover:bg-red-100'
            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';

          return (
            <Card key={newsletter.id} className="hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              {/* Status Stripe */}
              <div className={`h-1 ${getStatusColor(status)}`} />

              {/* Header with Badges */}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" className={statusBadgeClass}>
                      {statusLabel}
                    </Badge>
                    {isScheduled && newsletter.scheduled_at && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(newsletter.scheduled_at).toLocaleString()}
                      </Badge>
                    )}
                    {newsletter.open_rate !== null && newsletter.open_rate !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {/* Clamp to [0, 100] defensively — historical rows can still hold pre-fix values like 300. */}
                        {Math.max(0, Math.min(100, newsletter.open_rate)).toFixed(1)}% opens
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Cover Image */}
              {newsletter.cover_image_url && (
                <div className="px-6">
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <img
                      src={newsletter.cover_image_url}
                      alt={newsletter.subject}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <CardContent className="flex-1 pt-3">
                <CardTitle 
                  className="text-lg line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleView(newsletter)}
                >
                  {newsletter.subject}
                </CardTitle>
                
                <CardDescription className="line-clamp-2 mb-3">
                  {truncateContent(newsletter.content)}
                </CardDescription>

                {isFailed && newsletter.send_failure_reason && (
                  <div className="flex items-start gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5 mb-3">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{newsletter.send_failure_reason}</span>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{newsletter.recipient_count} recipients</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {isSent 
                        ? new Date(newsletter.sent_at!).toLocaleDateString()
                        : new Date(newsletter.created_at).toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* Footer Actions */}
              <div className="border-t px-4 py-3 bg-muted/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(newsletter)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Preview</span>
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
                          className="h-8 px-2"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Copy ID</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy newsletter ID to clipboard</TooltipContent>
                    </Tooltip>
                  </div>

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
              </div>
            </Card>
          );
        })}
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

export default NewslettersGrid;
