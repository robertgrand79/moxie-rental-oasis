
import React from 'react';
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
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const NewsletterCampaignsTable = ({ 
  campaigns, 
  loading, 
  onView, 
  onEdit, 
  onDelete 
}: NewsletterCampaignsTableProps) => {
  return (
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
                        onClick={() => onView(campaign.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!campaign.sent_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(campaign.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
};

export default NewsletterCampaignsTable;
