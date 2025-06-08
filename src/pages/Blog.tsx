
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Calendar, User, Search, Mail, MapPin, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import NewsletterSignup from '@/components/NewsletterSignup';
import LoadingState from '@/components/ui/loading-state';

const Blog = () => {
  const { blogPosts, loading } = useBlogPosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Filter posts based on search and tags
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
    return matchesSearch && matchesTag && post.status === 'published';
  });

  // Get all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags || [])));

  // Get Robert & Shelly's travel posts
  const travelTag = "Robert & Shelly's Travels";
  const robertShellyTravelPosts = blogPosts.filter(post => 
    post.tags?.includes(travelTag) && post.status === 'published'
  );

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <LoadingState variant="page" message="Loading blog posts..." />
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Moxie Travel Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover insider tips, local experiences, and travel inspiration for your Eugene adventures. 
            From hidden gems to must-visit attractions, we share everything you need to make the most of your stay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Robert & Shelly's Travel Feature */}
            {robertShellyTravelPosts.length > 0 && (
              <div className="mb-8">
                <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900 flex items-center justify-center gap-2">
                      <MapPin className="h-6 w-6 text-indigo-600" />
                      Robert & Shelly's World Adventures
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      Follow our hosts' incredible journeys around the globe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setSelectedTag(travelTag)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      Explore Their Adventures ({robertShellyTravelPosts.length} stories)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search and Filter Section */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag('')}
                  >
                    All Topics
                  </Button>
                  {/* Special Robert & Shelly button */}
                  <Button
                    variant={selectedTag === travelTag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(travelTag)}
                    className={selectedTag === travelTag 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent' 
                      : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'
                    }
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    World Adventures
                  </Button>
                  {allTags.filter(tag => tag !== travelTag).slice(0, 3).map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Blog Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                  {searchTerm || selectedTag ? 'No posts found' : 'No blog posts yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedTag 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Check back soon for travel tips and local insights!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {filteredPosts.map((post, index) => (
                  <Card key={post.id} className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-xl ${
                    index === 0 ? 'lg:grid lg:grid-cols-2 lg:gap-8' : ''
                  } ${post.tags?.includes(travelTag) ? 'ring-2 ring-indigo-200' : ''}`}>
                    {post.image_url && (
                      <div className={`${index === 0 ? 'lg:order-2' : ''} relative overflow-hidden`}>
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className={`w-full object-cover transition-transform duration-300 hover:scale-105 ${
                            index === 0 ? 'h-80 lg:h-full' : 'h-48'
                          }`}
                        />
                        {post.tags?.includes(travelTag) && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                              <Globe className="h-3 w-3 mr-1" />
                              World Adventure
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`${index === 0 ? 'lg:order-1' : ''}`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center text-sm text-gray-600 mb-3 flex-wrap gap-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>By {post.author}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {post.published_at 
                                ? new Date(post.published_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : 'Draft'
                              }
                            </span>
                          </div>
                        </div>
                        <CardTitle className={`hover:text-blue-600 transition-colors ${
                          index === 0 ? 'text-3xl' : 'text-xl'
                        }`}>
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className={`mb-4 leading-relaxed ${
                          index === 0 ? 'text-lg' : ''
                        }`}>
                          {post.excerpt}
                        </CardDescription>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="secondary"
                                className={`cursor-pointer hover:bg-blue-100 ${
                                  tag === travelTag 
                                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200' 
                                    : ''
                                }`}
                                onClick={() => setSelectedTag(tag)}
                              >
                                {tag === travelTag && <Globe className="h-3 w-3 mr-1" />}
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Link 
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Read More →
                        </Link>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Robert & Shelly's Latest Adventures */}
              {robertShellyTravelPosts.length > 0 && (
                <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-indigo-600" />
                      Latest Adventures
                    </CardTitle>
                    <CardDescription>
                      Robert & Shelly's recent travels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {robertShellyTravelPosts.slice(0, 3).map(post => (
                        <div key={post.id} className="border-b border-indigo-100 last:border-0 pb-4 last:pb-0">
                          <h4 className="font-medium text-sm mb-1">
                            <Link 
                              to={`/blog/${post.slug}`}
                              className="hover:text-indigo-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h4>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {post.published_at 
                              ? new Date(post.published_at).toLocaleDateString()
                              : 'Draft'
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      onClick={() => setSelectedTag(travelTag)}
                    >
                      View All Adventures
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter Signup Card */}
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-100/50 backdrop-blur-xl">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    Stay Updated
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    Get the latest travel tips and Eugene insights delivered to your inbox.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsletterSignup />
                </CardContent>
              </Card>

              {/* Popular Tags */}
              {allTags.length > 0 && (
                <Card className="border-0 bg-white/95 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`cursor-pointer transition-colors ${
                            tag === travelTag
                              ? 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'
                              : 'hover:bg-blue-50 hover:border-blue-300'
                          }`}
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag === travelTag && <Globe className="h-3 w-3 mr-1" />}
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Posts */}
              {blogPosts.length > 0 && (
                <Card className="border-0 bg-white/95 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {blogPosts.slice(0, 3).map(post => (
                        <div key={post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                          <h4 className="font-medium text-sm mb-1">
                            <Link 
                              to={`/blog/${post.slug}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h4>
                          <p className="text-xs text-gray-600">
                            {post.published_at 
                              ? new Date(post.published_at).toLocaleDateString()
                              : 'Draft'
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Blog;
