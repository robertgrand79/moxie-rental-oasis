
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Camera, 
  Star,
  Users,
  Eye,
  TrendingUp,
  Plus,
  Activity,
  BarChart3
} from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest';
import { useLifestyleGallery } from '@/hooks/useLifestyleGallery';
import { useTestimonials } from '@/hooks/useTestimonials';
import { usePages } from '@/hooks/usePages';

const EnhancedAdminDashboard = () => {
  const { properties } = useProperties();
  const { blogPosts } = useBlogPosts();
  const { events } = useEugeneEvents();
  const { pointsOfInterest } = usePointsOfInterest();
  const { lifestyleItems } = useLifestyleGallery();
  const { testimonials } = useTestimonials();
  const { pages } = usePages();

  const quickStats = [
    {
      title: 'Properties',
      value: properties.length,
      icon: Building2,
      color: 'text-blue-600',
      href: '/properties',
      actionText: 'Add Property'
    },
    {
      title: 'Blog Posts',
      value: blogPosts.length,
      icon: BookOpen,
      color: 'text-green-600',
      href: '/blog-management',
      actionText: 'Write Post'
    },
    {
      title: 'Pages',
      value: pages.length,
      icon: FileText,
      color: 'text-purple-600',
      href: '/page-management',
      actionText: 'Create Page'
    },
    {
      title: 'Events',
      value: events.length,
      icon: Calendar,
      color: 'text-orange-600',
      href: '/admin/events',
      actionText: 'Add Event'
    }
  ];

  const featureStats = [
    {
      title: 'Points of Interest',
      value: pointsOfInterest.length,
      icon: MapPin,
      href: '/admin/poi'
    },
    {
      title: 'Lifestyle Gallery',
      value: lifestyleItems.length,
      icon: Camera,
      href: '/admin/lifestyle'
    },
    {
      title: 'Testimonials',
      value: testimonials.length,
      icon: Star,
      href: '/admin/testimonials'
    }
  ];

  const recentPosts = blogPosts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your vacation rental website content and settings
            </p>
          </div>
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link to="/admin/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link to="/properties">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <Badge variant="secondary">{stat.value}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{stat.title}</h3>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to={stat.href}>
                    <Plus className="h-3 w-3 mr-1" />
                    {stat.actionText}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <stat.icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">{stat.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{stat.value}</Badge>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={stat.href}>Manage</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Blog Posts */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Blog Posts
              </CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link to="/blog-management">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={post.status === 'published' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {post.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No blog posts yet</p>
                <Button asChild size="sm" className="mt-2">
                  <Link to="/blog-management">Create Your First Post</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/properties">
                <Building2 className="h-4 w-4 mr-2" />
                Add New Property
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/blog-management">
                <BookOpen className="h-4 w-4 mr-2" />
                Write Blog Post
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/admin/events">
                <Calendar className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/site-settings">
                <Settings className="h-4 w-4 mr-2" />
                Update Site Settings
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/admin/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
