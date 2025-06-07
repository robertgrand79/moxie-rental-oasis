
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import Footer from '@/components/Footer';

const BlogPost = () => {
  const { slug } = useParams();
  const { blogPosts, loading } = useBlogPosts();

  // Find the post by slug from the database
  const post = blogPosts.find(p => p.slug === slug && p.status === 'published');

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'travel':
        return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200';
      case 'destinations':
        return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200';
      case 'luxury':
        return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200';
      case 'tips':
        return 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200';
      case 'vacation rentals':
        return 'bg-gradient-to-r from-teal-100 to-teal-50 text-teal-700 border-teal-200';
      case 'sustainability':
        return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200';
      case 'eco-tourism':
        return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200';
      case 'environment':
        return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200';
    }
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const renderContent = (content: string) => {
    // Enhanced markdown to HTML conversion with better styling
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-6 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-12 mb-8 text-gray-900">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-700">$1</em>')
      .replace(/^\- (.*$)/gim, '<li class="mb-2 text-gray-700">$1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-6 text-gray-700 leading-relaxed text-lg">')
      .replace(/\n/gim, '<br>');
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                  <div className="h-64 bg-gray-200 rounded mb-8"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </BackgroundWrapper>
    );
  }

  if (!post) {
    return (
      <BackgroundWrapper>
        <div className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Post Not Found</h1>
                <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  The blog post you're looking for doesn't exist or hasn't been published yet.
                </p>
                <Link to="/blog">
                  <Button className="bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-accent-from hover:to-gradient-from text-white border-0">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </BackgroundWrapper>
    );
  }

  const readingTime = estimateReadingTime(post.content);

  return (
    <BackgroundWrapper>
      <div className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Navigation */}
            <Link 
              to="/blog" 
              className="inline-flex items-center text-gradient-from hover:text-gradient-accent-from mb-8 font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Blog
            </Link>

            {/* Main Article */}
            <article className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-300">
              {/* Featured Image */}
              {post.image_url && (
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              <div className="p-16">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className={`px-4 py-2 text-sm rounded-full border ${getTagColor(tag)} font-medium`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-8 text-gray-600 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-icon-blue" />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-icon-emerald" />
                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Draft'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-icon-purple" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="text-xl text-gray-600 mb-12 leading-relaxed font-medium">
                  {post.excerpt}
                </div>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: `<p class="mb-6 text-gray-700 leading-relaxed text-lg">${renderContent(post.content)}</p>` 
                  }}
                />
              </div>
            </article>

            {/* Navigation */}
            <div className="mt-12 text-center">
              <Link to="/blog">
                <Button 
                  variant="outline" 
                  className="border-2 border-gradient-from text-gradient-from hover:bg-gradient-to-r hover:from-gradient-from hover:to-gradient-accent-from hover:text-white hover:border-transparent transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </BackgroundWrapper>
  );
};

export default BlogPost;
