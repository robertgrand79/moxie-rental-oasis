
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp, Building2, BookOpen, Calendar, Settings, BarChart3, Mail, FileText } from 'lucide-react';

const AdminQuickActions = () => {
  return (
    <Card className="bg-white/95 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/admin/properties?action=add">
            <Building2 className="h-4 w-4 mr-2" />
            Add New Property
          </Link>
        </Button>
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/admin/blog?action=add">
            <BookOpen className="h-4 w-4 mr-2" />
            Write Blog Post
          </Link>
        </Button>
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/admin/pages?action=add">
            <FileText className="h-4 w-4 mr-2" />
            Create Page
          </Link>
        </Button>
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/admin/events?action=add">
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/admin/newsletter-management">
            <Mail className="h-4 w-4 mr-2" />
            Send Newsletter
          </Link>
        </Button>
        <Button asChild className="w-full justify-start" variant="outline">
          <Link to="/admin/settings">
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
  );
};

export default AdminQuickActions;
