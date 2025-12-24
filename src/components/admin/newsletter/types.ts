// Shared Newsletter Campaign types

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  cover_image_url?: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
  open_rate?: number | null;
  click_rate?: number | null;
}

// Props interfaces for newsletter components
export interface NewsletterGridProps {
  newsletters: NewsletterCampaign[];
  onEdit: (newsletter: NewsletterCampaign) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onView?: (newsletter: NewsletterCampaign) => void;
  deleting: string | null;
}

export interface NewsletterListViewProps extends NewsletterGridProps {}

export interface NewsletterPreviewModalProps {
  campaign: NewsletterCampaign | null;
  open: boolean;
  onClose: () => void;
}

export interface NewsletterEditModalProps {
  campaign: NewsletterCampaign | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: { subject: string; content: string }) => Promise<void>;
  isSaving: boolean;
}

export interface NewsletterDeleteModalProps {
  campaign: NewsletterCampaign | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

// Email template config types
export interface HeaderConfig {
  title: string;
  subtitle: string;
  background_gradient: {
    from: string;
    to: string;
  };
  text_color: string;
  logo_url: string;
}

export interface FooterConfig {
  company_name: string;
  tagline: string;
  contact_info: {
    email: string;
    location: string;
  };
  links: Array<{
    text: string;
    url: string;
  }>;
  legal_links: Array<{
    text: string;
    url: string;
  }>;
  social_media: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

export interface NewsletterFormData {
  subject: string;
  content: string;
  cover_image_url?: string;
  linked_content?: {
    blog_posts: string[];
    events: string[];
    places: string[];
  };
  header_config?: HeaderConfig;
  footer_config?: FooterConfig;
}