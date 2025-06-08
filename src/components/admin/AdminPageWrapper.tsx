
import React from 'react';

interface AdminPageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const AdminPageWrapper = ({ 
  title, 
  description, 
  children, 
  actions 
}: AdminPageWrapperProps) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
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
