
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewsletterQuickActionsProps {
  onGenerateBlogNewsletter: (title: string, excerpt: string, slug: string) => void;
}

const NewsletterQuickActions = ({ onGenerateBlogNewsletter }: NewsletterQuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 mb-4">
          Generate newsletter content from recent blog posts:
        </div>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onGenerateBlogNewsletter(
              "Top 5 Vacation Destinations for 2024",
              "Discover the most sought-after vacation spots that offer unforgettable experiences and luxury accommodations.",
              "top-5-vacation-destinations-2024"
            )}
          >
            Use "Top 5 Vacation Destinations" Post
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onGenerateBlogNewsletter(
              "Making the Most of Your Vacation Rental Experience",
              "Essential tips and tricks to ensure your vacation rental stay exceeds all expectations.",
              "making-most-vacation-rental-experience"
            )}
          >
            Use "Vacation Rental Experience" Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterQuickActions;
