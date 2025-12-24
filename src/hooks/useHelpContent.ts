import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HelpCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpArticle {
  id: string;
  category_id: string | null;
  title: string;
  content: string;
  article_type: 'getting_started' | 'faq' | 'troubleshooting' | 'guide';
  tags: string[];
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: HelpCategory;
}

export interface HelpFAQ {
  id: string;
  category_id: string | null;
  question: string;
  answer: string;
  audience: 'owner' | 'guest' | 'both';
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: HelpCategory;
}

// Fetch all categories
export const useHelpCategories = () => {
  return useQuery({
    queryKey: ['help-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_categories')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as HelpCategory[];
    },
  });
};

// Fetch all articles
export const useHelpArticles = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['help-articles', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('help_articles')
        .select(`
          *,
          category:help_categories(*)
        `)
        .order('sort_order');
      
      if (categorySlug) {
        const { data: category } = await supabase
          .from('help_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as HelpArticle[];
    },
  });
};

// Fetch all FAQs
export const useHelpFAQs = (audience?: 'owner' | 'guest' | 'both') => {
  return useQuery({
    queryKey: ['help-faqs', audience],
    queryFn: async () => {
      let query = supabase
        .from('help_faqs')
        .select(`
          *,
          category:help_categories(*)
        `)
        .order('sort_order');
      
      if (audience) {
        query = query.or(`audience.eq.${audience},audience.eq.both`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as HelpFAQ[];
    },
  });
};

// Category mutations
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Partial<HelpCategory>) => {
      const { data, error } = await supabase
        .from('help_categories')
        .insert(category as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-categories'] });
      toast.success('Category created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HelpCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('help_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-categories'] });
      toast.success('Category updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('help_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-categories'] });
      toast.success('Category deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
};

// Article mutations
export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (article: Partial<HelpArticle>) => {
      const { data, error } = await supabase
        .from('help_articles')
        .insert(article as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
      toast.success('Article created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create article: ${error.message}`);
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HelpArticle> & { id: string }) => {
      const { data, error } = await supabase
        .from('help_articles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
      toast.success('Article updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update article: ${error.message}`);
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('help_articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
      toast.success('Article deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete article: ${error.message}`);
    },
  });
};

// FAQ mutations
export const useCreateFAQ = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (faq: Partial<HelpFAQ>) => {
      const { data, error } = await supabase
        .from('help_faqs')
        .insert(faq as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-faqs'] });
      toast.success('FAQ created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create FAQ: ${error.message}`);
    },
  });
};

export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HelpFAQ> & { id: string }) => {
      const { data, error } = await supabase
        .from('help_faqs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-faqs'] });
      toast.success('FAQ updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update FAQ: ${error.message}`);
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('help_faqs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-faqs'] });
      toast.success('FAQ deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete FAQ: ${error.message}`);
    },
  });
};
