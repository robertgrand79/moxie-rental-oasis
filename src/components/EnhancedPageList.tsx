
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Eye, EyeOff, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedPageListProps {
  pages: any[];
  onEdit: (page: any) => void;
  onDelete: (pageId: string) => void;
}

const EnhancedPageList = ({ pages, onEdit, onDelete }: EnhancedPageListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && page.is_published) ||
                         (statusFilter === 'draft' && !page.is_published);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (pageId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      onDelete(pageId);
    }
  };

  const handleViewPage = (slug: string) => {
    // Open page in new tab (assuming pages are accessible at /{slug})
    window.open(`/${slug}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search pages by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({pages.length})
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('published')}
          >
            Published ({pages.filter(p => p.is_published).length})
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('draft')}
          >
            Drafts ({pages.filter(p => !p.is_published).length})
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          Showing {filteredPages.length} of {pages.length} pages
        </div>
      )}

      {/* Pages Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No pages found matching your search.' : 'No pages created yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPages.map((page) => (
                <TableRow key={page.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{page.title}</div>
                      {page.meta_description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {page.meta_description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      /{page.slug}
                      {page.is_published && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPage(page.slug)}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.is_published ? 'default' : 'secondary'}>
                      {page.is_published ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Draft
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(page.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(page.updated_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(page)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(page.id, page.title)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EnhancedPageList;
