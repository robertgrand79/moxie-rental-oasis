
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Calendar, User, Tag } from 'lucide-react';
import SecureContentRenderer from '@/components/SecureContentRenderer';

interface BlogPostVisualPreviewProps {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  imageUrl?: string;
}

const BlogPostVisualPreview = ({ 
  title, 
  excerpt, 
  content, 
  author, 
  tags, 
  imageUrl 
}: BlogPostVisualPreviewProps) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Blog Post Preview
        </CardTitle>
        <CardDescription>
          Preview how your blog post will look to readers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
          {/* Blog Post Container */}
          <article className="max-w-4xl mx-auto">
            {/* Featured Image */}
            {imageUrl && (
              <div className="w-full h-64 bg-gray-200 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={title || 'Blog post featured image'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="p-8">
              {/* Article Header */}
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {title || 'Your Blog Post Title...'}
                </h1>
                
                <div className="flex items-center text-sm text-gray-600 mb-4 flex-wrap gap-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>By {author || 'Author'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{currentDate}</span>
                  </div>
                </div>

                {excerpt && (
                  <p className="text-xl text-gray-700 leading-relaxed mb-6 font-light">
                    {excerpt}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2 mb-6">
                    <Tag className="h-4 w-4 text-gray-500" />
                    {tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                <SecureContentRenderer
                  content={content || '<p style="color: #666; font-style: italic;">Start writing your blog post content...</p>'}
                  className="text-gray-800 leading-relaxed"
                />
              </div>

              {/* Article Footer */}
              <footer className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Published on {currentDate}</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Share
                    </button>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Save
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </article>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPostVisualPreview;
