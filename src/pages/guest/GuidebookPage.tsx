import React from 'react';
import { useParams } from 'react-router-dom';
import DigitalGuidebook from '@/components/guest/DigitalGuidebook';

const GuidebookPage = () => {
  const { propertyId } = useParams();

  if (!propertyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center py-24">
          <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🏠</span>
          </div>
          <h1 className="text-xl font-medium tracking-tight mt-4">Property Not Found</h1>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            The requested property guidebook could not be found.
          </p>
        </div>
      </div>
    );
  }

  return <DigitalGuidebook propertyId={propertyId} />;
};

export default GuidebookPage;
