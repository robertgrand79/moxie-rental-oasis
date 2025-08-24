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