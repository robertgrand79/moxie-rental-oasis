import React, { useState } from 'react';
import { FileText, Eye, Edit, Trash2, Calendar, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface PagesGridProps {
  pages: Page[];
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
}

const PagesGrid = ({ pages, onEdit, onDelete }: PagesGridProps) => {
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

  const truncateContent = (content: string = '', maxLength: number = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-2 mb-2">
                    {page.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
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
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-mono">/{page.slug || ''}</span>
                  </div>
                </div>
              </div>
              {page.meta_description && (
                <CardDescription className="line-clamp-2 text-xs">
                  {page.meta_description}
                </CardDescription>
              )}
              {page.content && (
                <CardDescription className="line-clamp-3">
                  {truncateContent(page.content)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(page.created_at).toLocaleDateString()}</span>
                  </div>
                  {page.updated_at !== page.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {page.is_published && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a href={`/${page.slug || ''}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(page)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(page)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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

export default PagesGrid;