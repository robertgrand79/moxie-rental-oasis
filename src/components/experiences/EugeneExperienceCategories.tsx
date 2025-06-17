
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Trees, Utensils, Palette, Baby, Camera } from 'lucide-react';

const EugeneExperienceCategories = () => {
  const eugeneCategories = [
    {
      icon: Trees,
      title: "Nature & Outdoors",
      description: "Explore Eugene's beautiful parks, trails, and natural areas.",
      activities: ["Spencer Butte Hiking", "Hendricks Park Gardens", "Alton Baker Park", "McKenzie River Trail"]
    },
    {
      icon: Utensils,
      title: "Food & Drink",
      description: "Discover Eugene's vibrant culinary scene and local breweries.",
      activities: ["Downtown Restaurants", "Local Breweries", "Farmers Markets", "Food Truck Pods"]
    },
    {
      icon: Palette,
      title: "Arts & Culture",
      description: "Experience Eugene's rich arts community and cultural attractions.",
      activities: ["Jordan Schnitzer Museum", "Hult Center", "Street Art Tours", "Local Galleries"]
    },
    {
      icon: Mountain,
      title: "Outdoor Adventures",
      description: "Active pursuits and adventure sports in and around Eugene.",
      activities: ["Bike Trails", "Rock Climbing", "River Activities", "Golf Courses"]
    },
    {
      icon: Camera,
      title: "Sightseeing",
      description: "Must-see landmarks and scenic spots around Eugene.",
      activities: ["University Campus", "Historic Districts", "Scenic Drives", "Photography Spots"]
    },
    {
      icon: Baby,
      title: "Family Activities",
      description: "Fun activities and attractions perfect for families with children.",
      activities: ["Science Factory", "Splash! at Lively Park", "Playgrounds", "Family Events"]
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
        What to Do in Eugene
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {eugeneCategories.map((category, index) => {
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
                  {category.activities.map((activity, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                      {activity}
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

export default EugeneExperienceCategories;
