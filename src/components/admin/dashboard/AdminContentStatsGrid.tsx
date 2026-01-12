import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Building2, BookOpen, MapPin, Camera, Star, Mail, ChevronRight } from 'lucide-react';

interface DashboardStats {
  properties: { total: number };
  blogPosts: { total: number; published: number };
  pointsOfInterest: { total: number; featured: number };
  galleryItems: { total: number; featured: number };
  testimonials: { total: number; featured: number };
  subscriberCount: number;
}

interface AdminContentStatsGridProps {
  stats: DashboardStats;
}

const AdminContentStatsGrid = ({ stats }: AdminContentStatsGridProps) => {
  const contentItems = [
    {
      title: 'Properties',
      count: stats.properties.total,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      href: '/admin/properties',
    },
    {
      title: 'Blog Posts',
      count: stats.blogPosts.total,
      subtitle: `${stats.blogPosts.published} published`,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      href: '/admin/blog',
    },
    {
      title: 'Points of Interest',
      count: stats.pointsOfInterest.total,
      subtitle: `${stats.pointsOfInterest.featured} featured`,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      href: '/admin/points-of-interest',
    },
    {
      title: 'Gallery',
      count: stats.galleryItems.total,
      subtitle: `${stats.galleryItems.featured} featured`,
      icon: Camera,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      href: '/admin/lifestyle-gallery',
    },
    {
      title: 'Reviews',
      count: stats.testimonials.total,
      subtitle: `${stats.testimonials.featured} featured`,
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      href: '/admin/reviews',
    },
    {
      title: 'Newsletter',
      count: stats.subscriberCount,
      subtitle: 'subscribers',
      icon: Mail,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500/10',
      href: '/admin/newsletter',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {contentItems.map((item) => (
        <Link
          key={item.title}
          to={item.href}
          className="group flex flex-col p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`h-9 w-9 rounded-lg ${item.bgColor} flex items-center justify-center`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-foreground">{item.count}</span>
          </div>
          
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
          )}
        </Link>
      ))}
    </div>
  );
};

export default AdminContentStatsGrid;
