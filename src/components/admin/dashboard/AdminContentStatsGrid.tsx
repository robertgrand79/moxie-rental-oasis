
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Building2, BookOpen, FileText, MapPin, Camera, Star, Mail, Users } from 'lucide-react';

interface ContentStat {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  actionText: string;
  actionHref: string;
  additionalStats?: {
    label: string;
    value: number | string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface AdminContentStatsGridProps {
  properties: any[];
  blogPosts: any[];
  pointsOfInterest: any[];
  galleryItems: any[];
  testimonials: any[];
  subscriberCount: number | null;
}

const AdminContentStatsGrid = ({ 
  properties, 
  blogPosts, 
  pointsOfInterest, 
  galleryItems, 
  testimonials, 
  subscriberCount 
}: AdminContentStatsGridProps) => {
  const contentStats: ContentStat[] = [
    {
      title: 'Properties',
      count: properties.length,
      icon: Building2,
      color: 'text-blue-600',
      href: '/admin/properties',
      actionText: 'Add Property',
      actionHref: '/admin/properties?action=add'
    },
    {
      title: 'Blog Posts',
      count: blogPosts.length,
      icon: BookOpen,
      color: 'text-green-600',
      href: '/admin/blog-management',
      actionText: 'Write Post',
      actionHref: '/admin/blog-management?action=add',
      additionalStats: [
        {
          label: 'Published',
          value: blogPosts.filter(post => post.status === 'published').length
        }
      ]
    },
    {
      title: 'Points of Interest',
      count: pointsOfInterest.length,
      icon: MapPin,
      color: 'text-purple-600',
      href: '/admin/poi',
      actionText: 'Add POI',
      actionHref: '/admin/poi?action=add',
      additionalStats: [
        {
          label: 'Featured',
          value: pointsOfInterest.filter(poi => poi.is_featured).length
        }
      ]
    },
    {
      title: 'Lifestyle Gallery',
      count: galleryItems.length,
      icon: Camera,
      color: 'text-orange-600',
      href: '/admin/lifestyle',
      actionText: 'Add Photo',
      actionHref: '/admin/lifestyle?action=add',
      additionalStats: [
        {
          label: 'Featured',
          value: galleryItems.filter(item => item.is_featured).length
        }
      ]
    },
    {
      title: 'Testimonials',
      count: testimonials.length,
      icon: Star,
      color: 'text-amber-600',
      href: '/admin/testimonials',
      actionText: 'Add Review',
      actionHref: '/admin/testimonials?action=add',
      additionalStats: [
        {
          label: 'Featured',
          value: testimonials.filter(testimonial => testimonial.is_featured).length
        }
      ]
    },
    {
      title: 'Newsletter',
      count: subscriberCount || 0,
      icon: Mail,
      color: 'text-indigo-600',
      href: '/admin/newsletter',
      actionText: 'Send Newsletter',
      actionHref: '/admin/newsletter',
      additionalStats: [
        {
          label: 'Subscribers',
          value: subscriberCount || 0,
          icon: Users
        }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contentStats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                {stat.count}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">{stat.title}</h3>
            
            {stat.additionalStats && (
              <div className="mb-4 space-y-2">
                {stat.additionalStats.map((addStat, index) => (
                  <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      {addStat.icon && <addStat.icon className="h-3 w-3 mr-1" />}
                      <span>{addStat.label}:</span>
                    </div>
                    <span className="font-medium">{addStat.value}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2">
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to={stat.actionHref}>
                  <Plus className="h-3 w-3 mr-1" />
                  {stat.actionText}
                </Link>
              </Button>
              
              <Button asChild size="sm" variant="ghost" className="w-full">
                <Link to={stat.href}>
                  Manage All
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminContentStatsGrid;
