
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BlogPost } from '@/hooks/useBlogPosts';
import NewsletterEditorWithPreview from './newsletter/NewsletterEditorWithPreview';

interface NewsletterFormData {
  subject: string;
  content: string;
  blogPostId?: string;
}

interface NewsletterEditorLayoutProps {
  form: UseFormReturn<NewsletterFormData>;
  content: string;
  setContent: (content: string) => void;
  onSubmit: (data: NewsletterFormData) => void;
  isLoading: boolean;
  subscriberCount: number | null;
  blogPosts: BlogPost[];
  blogPostsLoading: boolean;
}

const NewsletterEditorLayout = (props: NewsletterEditorLayoutProps) => {
  return <NewsletterEditorWithPreview {...props} />;
};

export default NewsletterEditorLayout;
