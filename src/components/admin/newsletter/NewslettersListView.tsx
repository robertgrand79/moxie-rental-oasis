import React, { useState } from 'react';
import { Mail, Eye, Edit, Trash2, MoreVertical, Copy, Users, Calendar } from 'lucide-react';
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

interface NewslettersListViewProps {
  newsletters: Newsletter[];
  onEdit: (newsletter: Newsletter) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onView?: (newsletter: Newsletter) => void;
  deleting: string | null;
}

const NewslettersListView = ({ newsletters, onEdit, onDelete, onCreateNew, onView, deleting }: NewslettersListViewProps) => {
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
              const isSent = !!newsletter.sent_at;
              
              return (
                <TableRow key={newsletter.id}>
                  {/* Status Indicator */}
                  <TableCell className="w-2 p-0">
                    <div className={`w-1 h-full min-h-[60px] ${getStatusColor(isSent)}`} />
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
                      variant={isSent ? "default" : "secondary"}
                      className={isSent ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}
                    >
                      {isSent ? "Sent" : "Draft"}
                    </Badge>
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
