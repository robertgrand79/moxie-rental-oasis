
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
    <div className="space-y-8">
      {/* Cleaner Page Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            {description && (
              <p className="text-gray-600 text-lg">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3 ml-6">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page Content with better spacing */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdminPageWrapper;
