
import React from 'react';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

const BackgroundWrapper = ({ children }: BackgroundWrapperProps) => {
  return (
    <div className="min-h-screen relative">
      {/* Simplified Background for better performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-gradient-from/60 via-gradient-via/40 to-gradient-to/60 z-0">
        {/* Subtle overlay pattern - only on desktop for performance */}
        <div 
          className="absolute inset-0 opacity-5 hidden lg:block" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' opacity='0.1'%3E%3Cpath d='M20 20c0 0 8 0 8-8s-8-8-8-8-8 0-8 8 8 8 8 8z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;
