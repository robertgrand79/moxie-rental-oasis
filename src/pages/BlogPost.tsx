
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { blogPostService } from '@/services/blogPostService';
import { BlogPost as BlogPostType } from '@/types/blogPost';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      console.log('🔍 Fetching blog post by slug:', slug);
      setLoading(true);
      setNotFound(false);
      
      try {
        const fetchedPost = await blogPostService.fetchBlogPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
          console.log('✅ Loaded blog post:', fetchedPost.title);
        } else {
          setNotFound(true);
          console.log('❌ Blog post not found');
        }
      } catch (error) {
        console.error('💥 Error fetching blog post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-xl text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog">
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/blog">
          <Button variant="outline" className="mb-8 bg-card border-border hover:bg-accent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-muted-foreground mb-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="mr-6">{formatDate(post.published_at || post.created_at)}</span>
            <User className="h-4 w-4 mr-1" />
            <span>{post.author}</span>
          </div>

          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Tag className="h-4 w-4 text-muted-foreground mr-1" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="mb-8 overflow-hidden rounded-lg shadow-lg">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg max-w-none bg-card rounded-lg p-8 shadow-sm border border-border">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground"
          />
        </article>

        {/* Back to Blog Footer */}
        <div className="mt-12 text-center">
          <Link to="/blog">
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Posts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
