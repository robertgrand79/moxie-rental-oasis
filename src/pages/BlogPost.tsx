
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  slug: string;
}

const BlogPost = () => {
  const { slug } = useParams();

  // Mock data - in a real app, this would fetch from an API based on the slug
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Top 5 Vacation Destinations for 2024',
      excerpt: 'Discover the most sought-after vacation spots that offer unforgettable experiences and luxury accommodations.',
      content: `# Top 5 Vacation Destinations for 2024

Planning your next vacation? 2024 brings some incredible destinations that promise unforgettable experiences. Here are our top picks for the most amazing vacation spots this year.

## 1. Santorini, Greece

The stunning Greek island of Santorini continues to captivate travelers with its iconic white-washed buildings, breathtaking sunsets, and crystal-clear waters. The volcanic landscape creates a unique backdrop that's perfect for romantic getaways.

**What makes it special:**
- Iconic sunset views from Oia
- Unique volcanic beaches
- World-class wineries
- Luxurious cave hotels

## 2. Kyoto, Japan

Experience the perfect blend of traditional and modern culture in Japan's ancient capital. From magnificent temples to serene gardens, Kyoto offers a peaceful escape from the bustling world.

**Highlights include:**
- Historic temples and shrines
- Traditional ryokan accommodations
- Cherry blossom season (spring)
- Authentic tea ceremonies

## 3. Costa Rica

For adventure seekers and nature lovers, Costa Rica provides an incredible array of experiences from rainforest exploration to pristine beaches on both the Pacific and Caribbean coasts.

## 4. Iceland

The land of fire and ice offers some of the most dramatic landscapes on Earth. From the Northern Lights to geothermal hot springs, Iceland is a photographer's paradise.

## 5. Tuscany, Italy

Rolling hills, historic vineyards, and charming medieval towns make Tuscany the perfect destination for those seeking culture, cuisine, and relaxation.

Each of these destinations offers unique experiences that will create lasting memories. Start planning your 2024 adventure today!`,
      author: 'Sarah Johnson',
      publishedAt: '2024-01-15',
      imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=600&fit=crop',
      tags: ['Travel', 'Destinations', 'Luxury'],
      slug: 'top-5-vacation-destinations-2024'
    }
  ];

  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderContent = (content: string) => {
    // Simple markdown to HTML conversion
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(/^\- (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, '<br>');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {post.imageUrl && (
              <div className="aspect-video bg-gray-200">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              <div className="flex items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${renderContent(post.content)}</p>` }}
              />
            </div>
          </article>

          <div className="mt-8 text-center">
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
