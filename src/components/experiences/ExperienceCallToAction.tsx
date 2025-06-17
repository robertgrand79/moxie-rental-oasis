
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
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
        <Button 
          size="lg" 
          className="w-full sm:w-auto bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90 shadow-lg px-8 py-3 text-base font-semibold"
        >
          Browse All Experiences
        </Button>
        <Button 
          size="lg" 
          className="w-full sm:w-auto bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary/80 shadow-lg px-8 py-3 text-base font-semibold"
        >
          View Properties
        </Button>
      </div>
    </div>
  );
};

export default ExperienceCallToAction;
