
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FeaturedExperiences = () => {
  const featuredExperiences = [
    {
      title: "Sunset Sailing in Malibu",
      description: "Experience the magic of a Pacific sunset aboard a luxury sailing yacht.",
      location: "Malibu, CA",
      duration: "3 hours",
      price: "$180",
      image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Mountain Hiking Adventure",
      description: "Guided hike through pristine mountain trails with breathtaking views.",
      location: "Aspen, CO",
      duration: "6 hours",
      price: "$120",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Art District Photography Tour",
      description: "Capture the vibrant street art and culture of the city's creative heart.",
      location: "New York, NY",
      duration: "4 hours",
      price: "$95",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
        Featured Experiences
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {featuredExperiences.map((experience, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img 
                src={experience.image} 
                alt={experience.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{experience.title}</CardTitle>
              <CardDescription>{experience.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm">{experience.description}</p>
              
              <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                <span>Duration: {experience.duration}</span>
                <span className="font-semibold text-primary text-lg">{experience.price}</span>
              </div>

              <Button className="w-full" size="sm">
                Book Experience
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedExperiences;
