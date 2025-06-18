
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BlogPost } from '@/types/blogPost';

interface BlogPostActionsProps {
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onPublish?: (post: BlogPost) => void;
}

const BlogPostActions = ({ post, onEdit, onDelete, onPublish }: BlogPostActionsProps) => {
  return (
    <div className="flex gap-2 ml-4">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      {post.status === 'draft' && onPublish && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
            >
              <Send className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publish Blog Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to publish "{post.title}"? This will make it visible to all visitors.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onPublish(post)}
                className="bg-green-600 hover:bg-green-700"
              >
                Publish Post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onEdit(post)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{post.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(post.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogPostActions;
