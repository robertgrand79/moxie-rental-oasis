
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, Plus } from 'lucide-react';

const AdminWelcomeSection = () => {
  return (
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
    </div>
  );
};

export default AdminWelcomeSection;
