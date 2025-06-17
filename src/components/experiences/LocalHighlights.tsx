
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Star } from 'lucide-react';

const LocalHighlights = () => {
  const highlights = [
    {
      title: "Hendricks Park & Rhododendron Garden",
      description: "Stunning botanical garden featuring over 6,000 rhododendrons in a natural forest setting.",
      location: "Summit Ave & Skyline Blvd",
      category: "Nature & Outdoors",
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
      features: ["Free Admission", "Walking Trails", "Photography"]
    },
    {
      title: "University of Oregon Campus",
      description: "Beautiful historic campus with iconic architecture, museums, and the famous Hayward Field.",
      location: "University District",
      category: "Culture & History",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
      features: ["Campus Tours", "Museums", "Historic Architecture"]
    },
    {
      title: "Spencer Butte",
      description: "Popular hiking destination offering panoramic views of Eugene and the Willamette Valley.",
      location: "South Eugene",
      category: "Outdoor Adventure",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80",
      features: ["Hiking Trails", "Scenic Views", "Pet Friendly"]
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
        Local Highlights
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {highlights.map((highlight, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img 
                src={highlight.image} 
                alt={highlight.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{highlight.title}</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {highlight.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm">{highlight.description}</p>
              
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {highlight.category}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {highlight.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-600">
                    <Star className="h-3 w-3 mr-2 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full" size="sm">
                Learn More
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LocalHighlights;
