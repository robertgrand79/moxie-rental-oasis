
import React from 'react';

interface AmenityHeaderProps {
  isMobile: boolean;
}

const AmenityHeader = ({ isMobile }: AmenityHeaderProps) => {
  if (isMobile) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Amenities & Features</h2>
        <p className="text-muted-foreground">Everything you need for a perfect stay</p>
      </div>
    );
  }

  return (
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-foreground mb-4">Amenities & Features</h2>
      <p className="text-xl text-muted-foreground">Everything you need for a perfect stay</p>
      <div className="w-24 h-1 bg-gradient-to-r from-primary/60 to-primary mx-auto mt-4 rounded-full"></div>
    </div>
  );
};

export default AmenityHeader;
