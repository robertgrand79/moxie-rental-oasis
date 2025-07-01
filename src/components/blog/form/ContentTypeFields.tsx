
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ContentType } from '@/types/blogPost';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';
import ArticleFields from './content-type/ArticleFields';
import EventFields from './content-type/EventFields';
import POIFields from './content-type/POIFields';
import LifestyleFields from './content-type/LifestyleFields';

interface ContentTypeFieldsProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  contentType: ContentType;
}

const ContentTypeFields = ({ form, contentType }: ContentTypeFieldsProps) => {
  switch (contentType) {
    case 'article':
      return <ArticleFields form={form} />;
    case 'event':
      return <EventFields form={form} />;
    case 'poi':
      return <POIFields form={form} />;
    case 'lifestyle':
      return <LifestyleFields form={form} />;
    default:
      return null;
  }
};

export default ContentTypeFields;
