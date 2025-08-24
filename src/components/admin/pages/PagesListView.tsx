import React, { useState } from 'react';
import { FileText, Eye, Edit, Trash2, Calendar, Globe, Lock } from 'lucide-react';
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
import PageDeleteModal from './PageDeleteModal';

interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface PagesListViewProps {
  pages: Page[];
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
}

const PagesListView = ({ pages, onEdit, onDelete }: PagesListViewProps) => {
  const [deletePage, setDeletePage] = useState<Page | null>(null);

  const handleDeleteClick = (page: Page) => {
    setDeletePage(page);
  };

  const handleDeleteConfirm = () => {
    if (deletePage) {
      onDelete(deletePage.id);
      setDeletePage(null);
    }
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No pages found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{page.title}</div>
                    {page.meta_description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {page.meta_description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">/{page.slug || ''}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={page.is_published ? "default" : "secondary"}>
                    {page.is_published ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Draft
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(page.created_at).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(page.updated_at).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    {page.is_published && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={`/${page.slug || ''}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(page)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <PageDeleteModal
        page={deletePage}
        open={!!deletePage}
        onClose={() => setDeletePage(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default PagesListView;