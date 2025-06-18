
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Eye, EyeOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { BlogPost } from '@/hooks/useBlogPosts';
import { toast } from '@/hooks/use-toast';

interface BlogBulkActionsProps {
  posts: BlogPost[];
  selectedPosts: string[];
  onSelectedPostsChange: (selectedPosts: string[]) => void;
  onUpdatePost: (postId: string, data: Partial<BlogPost>) => Promise<BlogPost | null>;
  onDeletePost: (postId: string) => Promise<void>;
}

const BlogBulkActions = ({
  posts,
  selectedPosts,
  onSelectedPostsChange,
  onUpdatePost,
  onDeletePost
}: BlogBulkActionsProps) => {
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionErrors, setActionErrors] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedPostsChange(posts.map(post => post.id));
    } else {
      onSelectedPostsChange([]);
    }
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      onSelectedPostsChange([...selectedPosts, postId]);
    } else {
      onSelectedPostsChange(selectedPosts.filter(id => id !== postId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPosts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select an action and at least one post.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setActionErrors([]);
    
    try {
      if (bulkAction === 'delete') {
        const confirmDelete = window.confirm(
          `Are you sure you want to delete ${selectedPosts.length} selected post(s)? This action cannot be undone.`
        );
        
        if (!confirmDelete) {
          setIsProcessing(false);
          return;
        }

        // Delete posts one by one with error tracking
        const errors: string[] = [];
        let successCount = 0;

        for (const postId of selectedPosts) {
          try {
            await onDeletePost(postId);
            successCount++;
          } catch (error) {
            const postTitle = posts.find(p => p.id === postId)?.title || 'Unknown post';
            errors.push(`Failed to delete "${postTitle}"`);
            console.error(`Failed to delete post ${postId}:`, error);
          }
        }
        
        if (errors.length > 0) {
          setActionErrors(errors);
          toast({
            title: 'Partial Success',
            description: `Successfully deleted ${successCount} post(s). ${errors.length} failed.`,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Success',
            description: `Successfully deleted ${successCount} post(s).`
          });
        }
      } else if (bulkAction === 'publish') {
        // Publish selected posts with error tracking
        const errors: string[] = [];
        let successCount = 0;

        for (const postId of selectedPosts) {
          try {
            const result = await onUpdatePost(postId, { 
              status: 'published',
              published_at: new Date().toISOString()
            });
            if (result) successCount++;
          } catch (error) {
            const postTitle = posts.find(p => p.id === postId)?.title || 'Unknown post';
            errors.push(`Failed to publish "${postTitle}"`);
            console.error(`Failed to publish post ${postId}:`, error);
          }
        }
        
        if (errors.length > 0) {
          setActionErrors(errors);
          toast({
            title: 'Partial Success',
            description: `Successfully published ${successCount} post(s). ${errors.length} failed.`,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Success',
            description: `Successfully published ${successCount} post(s).`
          });
        }
      } else if (bulkAction === 'draft') {
        // Unpublish selected posts with error tracking
        const errors: string[] = [];
        let successCount = 0;

        for (const postId of selectedPosts) {
          try {
            const result = await onUpdatePost(postId, { 
              status: 'draft',
              published_at: null
            });
            if (result) successCount++;
          } catch (error) {
            const postTitle = posts.find(p => p.id === postId)?.title || 'Unknown post';
            errors.push(`Failed to move "${postTitle}" to draft`);
            console.error(`Failed to update post ${postId}:`, error);
          }
        }
        
        if (errors.length > 0) {
          setActionErrors(errors);
          toast({
            title: 'Partial Success',
            description: `Successfully moved ${successCount} post(s) to draft. ${errors.length} failed.`,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Success',
            description: `Successfully moved ${successCount} post(s) to draft.`
          });
        }
      }

      // Clear selection only if no errors occurred
      if (actionErrors.length === 0) {
        onSelectedPostsChange([]);
        setBulkAction('');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while processing the bulk action.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isAllSelected = posts.length > 0 && selectedPosts.length === posts.length;
  const isPartiallySelected = selectedPosts.length > 0 && selectedPosts.length < posts.length;

  return (
    <div className="space-y-4">
      {/* Header with Select All */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={isAllSelected ? true : isPartiallySelected ? "indeterminate" : false}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedPosts.length > 0 
              ? `${selectedPosts.length} of ${posts.length} selected`
              : 'Select all posts'
            }
          </span>
        </div>

        {selectedPosts.length > 0 && (
          <div className="flex items-center space-x-3">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Bulk actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Publish
                  </div>
                </SelectItem>
                <SelectItem value="draft">
                  <div className="flex items-center">
                    <EyeOff className="h-4 w-4 mr-2" />
                    Move to Draft
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleBulkAction}
              disabled={!bulkAction || isProcessing}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {actionErrors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Some actions failed:</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {actionErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Individual Post Checkboxes */}
      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center space-x-3 p-3 bg-white rounded border hover:bg-gray-50">
            <Checkbox
              checked={selectedPosts.includes(post.id)}
              onCheckedChange={(checked) => handleSelectPost(post.id, checked as boolean)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {post.title}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {post.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                by {post.author} • {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogBulkActions;
