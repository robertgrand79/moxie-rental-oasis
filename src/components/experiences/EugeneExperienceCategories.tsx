
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Trees, Utensils, Palette, Baby, Camera } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const EugeneExperienceCategories = () => {
  const { settings } = useTenantSettings();
  const locationText = settings.heroLocationText || 'the Area';

  const categories = [
    {
      icon: Trees,
      title: "Nature & Outdoors",
      description: "Explore beautiful parks, trails, and natural areas.",
      activities: ["Hiking Trails", "Gardens & Parks", "Nature Reserves", "Scenic Overlooks"]
    },
    {
      icon: Utensils,
      title: "Food & Drink",
      description: "Discover the vibrant culinary scene and local favorites.",
      activities: ["Local Restaurants", "Craft Breweries", "Farmers Markets", "Cafes & Bakeries"]
    },
    {
      icon: Palette,
      title: "Arts & Culture",
      description: "Experience the rich arts community and cultural attractions.",
      activities: ["Museums", "Live Performances", "Art Galleries", "Historic Sites"]
    },
    {
      icon: Mountain,
      title: "Outdoor Adventures",
      description: "Active pursuits and adventure sports in the region.",
      activities: ["Bike Trails", "Water Activities", "Golf Courses", "Adventure Tours"]
    },
    {
      icon: Camera,
      title: "Sightseeing",
      description: "Must-see landmarks and scenic spots.",
      activities: ["Landmarks", "Scenic Drives", "Photography Spots", "Historic Districts"]
    },
    {
      icon: Baby,
      title: "Family Activities",
      description: "Fun activities and attractions perfect for families.",
      activities: ["Children's Museums", "Parks & Playgrounds", "Family Events", "Interactive Attractions"]
    }
  ];

  return (
    <div className="container mx-auto px-4 mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
        What to Do in {locationText}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category, index) => {
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
