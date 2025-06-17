
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LocalExperienceCallToAction = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Ready to Explore Eugene?
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Book your vacation rental and start planning your Eugene adventure with our local guide 
        to the best attractions, dining, and activities.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="px-8">
          <Link to="/properties">
            Browse Properties
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="px-8">
          <Link to="/events">
            View Local Events
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default LocalExperienceCallToAction;
