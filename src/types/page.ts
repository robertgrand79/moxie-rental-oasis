
export interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  organization_id: string;
}

export interface PageFormData {
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  is_published: boolean;
}

export interface CreatePageData extends PageFormData {
  created_by: string;
  organization_id: string;
}
