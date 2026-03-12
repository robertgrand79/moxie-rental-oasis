
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, Building2, BookOpen, FileText, Calendar } from 'lucide-react';

interface QuickStat {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
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
      href: '/properties',
      actionText: 'Add Property'
    },
    {
      title: 'Blog Posts',
      value: blogPosts.length,
      icon: BookOpen,
      href: '/admin/blog',
      actionText: 'Write Post'
    },
    {
      title: 'Custom Pages',
      value: pages.length,
      icon: FileText,
      href: '/admin/pages',
      actionText: 'Create Page'
    },
    {
      title: 'Events',
      value: events.length,
      icon: Calendar,
      href: '/admin/events',
      actionText: 'Add Event'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickStats.map((stat) => (
        <Card key={stat.title} className="border-border/30 bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-4xl font-semibold tracking-tight text-foreground">{stat.value}</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{stat.title}</p>
            <Link
              to={stat.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              {stat.actionText}
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminQuickStats;
