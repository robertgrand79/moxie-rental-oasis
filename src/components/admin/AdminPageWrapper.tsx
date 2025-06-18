
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Mobile-Optimized Page Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div className="flex-1">
            <h1 className={`font-bold text-gray-900 mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              {title}
            </h1>
            {description && (
              <p className={`text-gray-600 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className={`flex items-center ${isMobile ? 'justify-center w-full' : 'space-x-3 ml-6'}`}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-Optimized Page Content */}
      <div className="bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdminPageWrapper;
