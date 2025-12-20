
import React from 'react';

const EventsLoadingState = () => {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-muted rounded w-1/3 mx-auto mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-96 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>
  );
};

export default EventsLoadingState;
