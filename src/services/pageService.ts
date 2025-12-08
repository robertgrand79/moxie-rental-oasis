
import { supabase } from '@/integrations/supabase/client';
import { Page, CreatePageData } from '@/types/page';

export const pageService = {
  async fetchPages(organizationId?: string): Promise<Page[]> {
    let query = supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }

    return data || [];
  },

  async createPage(pageData: CreatePageData): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .insert([pageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating page:', error);
      throw error;
    }

    return data;
  },

  async updatePage(pageId: string, pageData: Partial<CreatePageData>): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .update(pageData)
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating page:', error);
      throw error;
    }

    return data;
  },

  async deletePage(pageId: string): Promise<void> {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId);

    if (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  },

  async checkPageExists(slug: string, organizationId?: string): Promise<boolean> {
    let query = supabase
      .from('pages')
      .select('id')
      .eq('slug', slug);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data } = await query.maybeSingle();

    return !!data;
  }
};
