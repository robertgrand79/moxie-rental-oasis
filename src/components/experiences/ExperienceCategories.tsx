
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Waves, Camera, Bike, Compass, Sunset } from 'lucide-react';

const ExperienceCategories = () => {
  const experienceCategories = [
    {
      icon: Mountain,
      title: "Adventure Sports",
      description: "Hiking, rock climbing, skiing, and mountain biking in breathtaking locations.",
      experiences: ["Guided Mountain Hikes", "Rock Climbing Lessons", "Ski Packages", "Mountain Biking Tours"]
    },
    {
      icon: Waves,
      title: "Water Activities",
      description: "Surfing, diving, sailing, and water sports for ocean enthusiasts.",
      experiences: ["Surfing Lessons", "Scuba Diving", "Sailing Charters", "Kayak Tours"]
    },
    {
      icon: Camera,
      title: "Cultural Immersion",
      description: "Photography tours, art classes, and cultural experiences with locals.",
      experiences: ["Photography Workshops", "Art Classes", "Cultural Tours", "Local Markets"]
    },
    {
      icon: Bike,
      title: "Outdoor Exploration",
      description: "Cycling tours, nature walks, and outdoor adventures for all skill levels.",
      experiences: ["Cycling Tours", "Nature Walks", "Bird Watching", "Outdoor Yoga"]
    },
    {
      icon: Compass,
      title: "Guided Tours",
      description: "Expert-led tours to discover hidden gems and local attractions.",
      experiences: ["Historical Tours", "Nature Guides", "City Exploration", "Local Insights"]
    },
    {
      icon: Sunset,
      title: "Wellness & Relaxation",
      description: "Spa treatments, meditation, and wellness activities for mind and body.",
      experiences: ["Spa Services", "Meditation Sessions", "Wellness Retreats", "Yoga Classes"]
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
        Experience Categories
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experienceCategories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.experiences.map((exp, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                      {exp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExperienceCategories;
