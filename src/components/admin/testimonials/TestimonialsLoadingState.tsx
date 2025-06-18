
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestimonialsLoadingState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Testimonials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsLoadingState;
