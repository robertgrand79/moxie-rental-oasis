
import React, { useState } from 'react';
import { Mail, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import NewsletterPreviewModal from './NewsletterPreviewModal';
import NewsletterDeleteModal from './NewsletterDeleteModal';
import NewsletterEditModal from './NewsletterEditModal';

interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsletterCampaignsTableProps {
  campaigns: NewsletterCampaign[];
  loading: boolean;
  deleting: string | null;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: { subject: string; content: string }) => Promise<void>;
  editing: string | null;
}

const NewsletterCampaignsTable = ({ 
  campaigns, 
  loading, 
  deleting,
  onDelete,
  onEdit,
  editing,
}: NewsletterCampaignsTableProps) => {
  const [previewCampaign, setPreviewCampaign] = useState<NewsletterCampaign | null>(null);
  const [deleteCampaign, setDeleteCampaign] = useState<NewsletterCampaign | null>(null);
  const [editCampaign, setEditCampaign] = useState<NewsletterCampaign | null>(null);

  const handleView = (campaign: NewsletterCampaign) => {
    setPreviewCampaign(campaign);
  };

  const handleEdit = (campaign: NewsletterCampaign) => {
    setEditCampaign(campaign);
  };

  const handleDeleteClick = (campaign: NewsletterCampaign) => {
    setDeleteCampaign(campaign);
  };

  const handleDeleteConfirm = () => {
    if (deleteCampaign) {
      onDelete(deleteCampaign.id);
      setDeleteCampaign(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sent Newsletters</CardTitle>
          <CardDescription>
            View and manage your sent newsletter campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No newsletters have been sent yet</p>
              <p className="text-sm">Create and send your first newsletter from the Create Newsletter tab</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.subject}</TableCell>
                    <TableCell>
                      {campaign.sent_at 
                        ? new Date(campaign.sent_at).toLocaleDateString() 
                        : 'Not sent'
                      }
                    </TableCell>
                    <TableCell>{campaign.recipient_count}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.sent_at ? "default" : "secondary"}>
                        {campaign.sent_at ? "Sent" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(campaign)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!campaign.sent_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(campaign)}
                          disabled={deleting === campaign.id}
                        >
                          {deleting === campaign.id ? (
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
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <NewsletterPreviewModal
        campaign={previewCampaign}
        open={!!previewCampaign}
        onClose={() => setPreviewCampaign(null)}
      />

      {/* Delete Confirmation Modal */}
      <NewsletterDeleteModal
        campaign={deleteCampaign}
        open={!!deleteCampaign}
        onClose={() => setDeleteCampaign(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleting === deleteCampaign?.id}
      />

      {/* Edit Modal */}
      <NewsletterEditModal
        campaign={editCampaign}
        open={!!editCampaign}
        onClose={() => setEditCampaign(null)}
        onSave={onEdit}
        isSaving={editing === editCampaign?.id}
      />
    </>
  );
};

export default NewsletterCampaignsTable;
