
export interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  meta_description?: string;
  is_published: boolean;
  show_in_nav?: boolean;
  nav_order?: number;
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
  show_in_nav: boolean;
}

export interface CreatePageData extends PageFormData {
  created_by: string;
  organization_id: string;
}
