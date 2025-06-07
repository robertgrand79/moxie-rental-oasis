
import React from 'react';
import { Button } from '@/components/ui/button';

const ExperienceCallToAction = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Ready for Your Next Adventure?
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Book your vacation rental and add unforgettable experiences to make 
        your trip truly extraordinary.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="px-8">
          Browse All Experiences
        </Button>
        <Button size="lg" variant="outline" className="px-8">
          View Properties
        </Button>
      </div>
    </div>
  );
};

export default ExperienceCallToAction;
