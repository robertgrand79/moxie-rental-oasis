
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Building2, BookOpen, FileText, Calendar } from 'lucide-react';

interface QuickStat {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  actionText: string;
}

interface AdminQuickStatsProps {
  properties: any[];
  blogPosts: any[];
  pages: any[];
  events: any[];
}

const AdminQuickStats = ({ properties, blogPosts, pages, events }: AdminQuickStatsProps) => {
  const quickStats: QuickStat[] = [
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  );
};

export default AdminQuickStats;
