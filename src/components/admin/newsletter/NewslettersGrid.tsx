import React, { useState } from 'react';
import { Mail, Eye, Edit, Trash2, Users, Calendar, Send, MoreVertical, Copy, ExternalLink } from 'lucide-react';
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

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  cover_image_url?: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
  open_rate?: number | null;
  click_rate?: number | null;
}

interface NewslettersGridProps {
  newsletters: Newsletter[];
  onEdit: (newsletter: Newsletter) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onView?: (newsletter: Newsletter) => void;
  deleting: string | null;
}

const NewslettersGrid = ({ newsletters, onEdit, onDelete, onCreateNew, onView, deleting }: NewslettersGridProps) => {
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);
  const [deleteNewsletter, setDeleteNewsletter] = useState<Newsletter | null>(null);

  const handleView = (newsletter: Newsletter) => {
    if (onView) {
      onView(newsletter);
    } else {
      setPreviewNewsletter(newsletter);
    }
  };

  const handleDeleteClick = (newsletter: Newsletter) => {
    setDeleteNewsletter(newsletter);
  };

  const handleDeleteConfirm = () => {
    if (deleteNewsletter) {
      onDelete(deleteNewsletter.id);
      setDeleteNewsletter(null);
    }
  };

  const handleCopyId = (newsletter: Newsletter) => {
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

  const getStatusColor = (isSent: boolean) => {
    return isSent ? 'bg-green-500' : 'bg-yellow-500';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsletters.map((newsletter) => {
          const isSent = !!newsletter.sent_at;
          
          return (
            <Card key={newsletter.id} className="hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              {/* Status Stripe */}
              <div className={`h-1 ${getStatusColor(isSent)}`} />
              
              {/* Header with Badges */}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={isSent ? "default" : "secondary"}
                      className={isSent ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}
                    >
                      {isSent ? "Sent" : "Draft"}
                    </Badge>
                    {newsletter.open_rate !== null && newsletter.open_rate !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {newsletter.open_rate.toFixed(1)}% opens
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
                  <div className="flex items-center gap-2">
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
                          className="h-8"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy ID
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
                    <DropdownMenuContent align="end" className="w-48 bg-popover">
                      <DropdownMenuItem onClick={() => handleView(newsletter)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {!isSent && (
                        <DropdownMenuItem onClick={() => onEdit(newsletter)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(newsletter)}
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
