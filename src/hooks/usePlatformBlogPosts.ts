import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string | null;
  image_url: string | null;
  tags: string[] | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  read_time: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type PlatformBlogPostInput = Partial<Omit<PlatformBlogPost, 'id' | 'created_at' | 'updated_at'>> & { title: string; slug: string; excerpt: string; content: string };

export const usePlatformBlogPosts = (publishedOnly = true) => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['platform-blog-posts', publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from('platform_blog_posts')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false });

      if (publishedOnly) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PlatformBlogPost[];
    },
  });

  const createPost = useMutation({
    mutationFn: async (post: PlatformBlogPostInput) => {
      const { data, error } = await supabase
        .from('platform_blog_posts')
        .insert([post])
        .select()
        .single();

      if (error) throw error;
      return data as PlatformBlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-blog-posts'] });
      toast.success('Blog post created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PlatformBlogPostInput> }) => {
      const { data, error } = await supabase
        .from('platform_blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformBlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-blog-posts'] });
      toast.success('Blog post updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update post: ${error.message}`);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-blog-posts'] });
      toast.success('Blog post deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });

  const publishPost = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('platform_blog_posts')
        .update({ 
          status: 'published', 
          published_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformBlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-blog-posts'] });
      toast.success('Blog post published');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish post: ${error.message}`);
    },
  });

  const unpublishPost = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('platform_blog_posts')
        .update({ status: 'draft' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformBlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-blog-posts'] });
      toast.success('Blog post unpublished');
    },
    onError: (error: Error) => {
      toast.error(`Failed to unpublish post: ${error.message}`);
    },
  });

  return {
    posts: posts || [],
    isLoading,
    error: error?.message || null,
    refetch,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
  };
};

export const usePlatformBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['platform-blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data as PlatformBlogPost;
    },
    enabled: !!slug,
  });
};
