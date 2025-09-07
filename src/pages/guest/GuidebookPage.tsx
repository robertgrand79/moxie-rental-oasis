import React from 'react';
import { useParams } from 'react-router-dom';
import DigitalGuidebook from '@/components/guest/DigitalGuidebook';

const GuidebookPage = () => {
  const { propertyId } = useParams();

  if (!propertyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground">The requested property guidebook could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <DigitalGuidebook propertyId={propertyId} />
    </div>
  );
};

export default GuidebookPage;