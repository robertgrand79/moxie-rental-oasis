
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

  return (
    <BackgroundWrapper>
      <div className="py-32 relative">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Moxie Travel Blog
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-12"></div>
            <p className="text-2xl text-gray-700 max-w-5xl mx-auto leading-relaxed">
              Discover travel tips, destination guides, and insider insights for your next vacation rental adventure in Eugene and beyond.
            </p>
          </div>

          {/* Newsletter Signup Section */}
          <div className="mb-20">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20 max-w-2xl hover:shadow-3xl transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Connected</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">Get the latest travel tips and Eugene insights delivered to your inbox</p>
              </div>
              <NewsletterSignup />
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20 hover:shadow-3xl transition-all duration-300">
            {blogPosts.length > 0 ? (
              <>
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Latest Stories</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogPosts.map((post) => (
                    <Card key={post.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-xl border-white/30 hover:-translate-y-2">
                      <div className="aspect-video bg-gray-200 relative overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardHeader className="pb-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <span 
                              key={tag}
                              className={`px-3 py-1 text-sm rounded-full border ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <CardTitle className="text-xl hover:text-gradient-from transition-colors group-hover:text-gradient-from">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-gray-600 leading-relaxed">{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-icon-blue" />
                            <span className="font-medium">{post.author}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-icon-emerald" />
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link to={`/blog/${post.slug}`}>
                          <Button variant="outline" className="w-full group-hover:bg-gradient-to-r group-hover:from-gradient-from group-hover:to-gradient-accent-from group-hover:text-white group-hover:border-transparent transition-all duration-300">
                            Read More
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">We're working on bringing you amazing travel content. Stay tuned!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Blog;
