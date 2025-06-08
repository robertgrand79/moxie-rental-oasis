
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminPageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  backUrl?: string;
  actions?: React.ReactNode;
}

const AdminPageWrapper = ({ 
  title, 
  description, 
  children, 
  backUrl = '/admin',
  actions 
}: AdminPageWrapperProps) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link to={backUrl}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        {children}
      </div>
    </div>
  );
};

export default AdminPageWrapper;
