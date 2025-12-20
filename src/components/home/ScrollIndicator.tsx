
import React from 'react';

const ScrollIndicator = () => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <div className="w-6 h-10 border-2 border-primary-foreground rounded-full flex justify-center">
        <div className="w-1 h-3 bg-primary-foreground rounded-full mt-2"></div>
      </div>
    </div>
  );
};

export default ScrollIndicator;
