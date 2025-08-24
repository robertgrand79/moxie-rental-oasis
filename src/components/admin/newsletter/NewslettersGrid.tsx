import React, { useState } from 'react';
import { Mail, Eye, Edit, Trash2, Users, Calendar, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
}

interface NewslettersGridProps {
  newsletters: Newsletter[];
  onEdit: (newsletter: Newsletter) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
}

const NewslettersGrid = ({ newsletters, onEdit, onDelete, deleting }: NewslettersGridProps) => {
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);
  const [deleteNewsletter, setDeleteNewsletter] = useState<Newsletter | null>(null);

  const handleView = (newsletter: Newsletter) => {
    setPreviewNewsletter(newsletter);
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  if (newsletters.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No newsletters found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first newsletter campaign.
        </p>
        <Button onClick={() => {}}>
          <Send className="h-4 w-4 mr-2" />
          Create Newsletter
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsletters.map((newsletter) => (
          <Card key={newsletter.id} className="hover:shadow-md transition-shadow">
            {newsletter.cover_image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={newsletter.cover_image_url}
                  alt={newsletter.subject}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-2 mb-2">
                    {newsletter.subject}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={newsletter.sent_at ? "default" : "secondary"}>
                      {newsletter.sent_at ? "Sent" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="line-clamp-3">
                {truncateContent(newsletter.content)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{newsletter.recipient_count} recipients</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {newsletter.sent_at 
                        ? new Date(newsletter.sent_at).toLocaleDateString()
                        : new Date(newsletter.created_at).toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(newsletter)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {!newsletter.sent_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(newsletter)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(newsletter)}
                    disabled={deleting === newsletter.id}
                    className="flex-shrink-0"
                  >
                    {deleting === newsletter.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
    </>
  );
};

export default NewslettersGrid;