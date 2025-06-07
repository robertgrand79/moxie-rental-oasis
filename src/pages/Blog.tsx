
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterSignup from '@/components/NewsletterSignup';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

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

const Blog = () => {
  const [blogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Top 5 Vacation Destinations for 2024',
      excerpt: 'Discover the most sought-after vacation spots that offer unforgettable experiences and luxury accommodations.',
      content: 'Full blog post content here...',
      author: 'Sarah Johnson',
      publishedAt: '2024-01-15',
      imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop',
      tags: ['Travel', 'Destinations', 'Luxury'],
      slug: 'top-5-vacation-destinations-2024'
    },
    {
      id: '2',
      title: 'Making the Most of Your Vacation Rental Experience',
      excerpt: 'Essential tips and tricks to ensure your vacation rental stay exceeds all expectations.',
      content: 'Full blog post content here...',
      author: 'Mike Chen',
      publishedAt: '2024-01-10',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop',
      tags: ['Tips', 'Vacation Rentals', 'Travel'],
      slug: 'making-most-vacation-rental-experience'
    },
    {
      id: '3',
      title: 'Sustainable Tourism: Eco-Friendly Vacation Options',
      excerpt: 'Learn how to travel responsibly while still enjoying amazing vacation experiences.',
      content: 'Full blog post content here...',
      author: 'Emma Davis',
      publishedAt: '2024-01-05',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
      tags: ['Sustainability', 'Eco-Tourism', 'Environment'],
      slug: 'sustainable-tourism-eco-friendly-options'
    }
  ]);

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">Moxie Travel Blog</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Discover travel tips, destination guides, and insider insights for your next vacation rental adventure in Eugene and beyond.
          </p>
        </div>

        {/* Newsletter Signup Section */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <NewsletterSignup />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
              <div className="aspect-video bg-gray-200 relative">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-gray-600">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <Button variant="outline" className="w-full">
                    Read More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-12 border border-white/20">
              <p className="text-gray-500 text-lg">No blog posts published yet.</p>
            </div>
          </div>
        )}
      </div>
    </BackgroundWrapper>
  );
};

export default Blog;
