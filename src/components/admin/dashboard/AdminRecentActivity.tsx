
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Activity, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface AdminRecentActivityProps {
  blogPosts: BlogPost[];
}

const AdminRecentActivity = ({ blogPosts }: AdminRecentActivityProps) => {
  const recentPosts = blogPosts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <Card className="bg-white/95 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Blog Posts
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/blog">View All</Link>
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
              <Link to="/admin/blog">Create Your First Post</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRecentActivity;
