
import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const BlogHero = () => {
  const { settings } = useTenantSettings();
  
  const blogTitle = settings.blogTitle || `${settings.site_name || 'Our'} Blog`;
  const blogDescription = settings.blogDescription || 
    'Discover travel insights, local favorites, and inspiration from our team.';

  return (
    <div className="text-center mb-16">
      <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 flex items-center justify-center gap-4">
        <BookOpen className="h-12 w-12 text-primary" />
        {blogTitle}
      </h1>
      <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
        {blogDescription}
      </p>
    </div>
  );
};

export default BlogHero;
