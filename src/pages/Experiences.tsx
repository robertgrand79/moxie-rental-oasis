
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mountain, Waves, Camera, Bike, Compass, Sunset, MapPin, Utensils, Coffee, Wine, Baby, ShoppingCart } from 'lucide-react';

const Experiences = () => {
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

  const localFavorites = [
    { category: "Attractions", icon: MapPin, items: [] },
    { category: "Bars", icon: Wine, items: [] },
    { category: "Breakfast & Brunch", icon: Coffee, items: [] },
    { category: "Breweries", icon: Wine, items: [] },
    { category: "Coffee Shops", icon: Coffee, items: [] },
    { category: "Desserts & Sweet Treats", icon: Utensils, items: [] },
    { category: "Dinner", icon: Utensils, items: [] },
    { category: "Distilleries", icon: Wine, items: [] },
    { category: "Favorite Eats & Drinks", icon: Utensils, items: [] },
    { category: "Food Trucks", icon: Utensils, items: [] },
    { category: "For Kiddos", icon: Baby, items: [] },
    { category: "Grocery Stores", icon: ShoppingCart, items: [] },
    { category: "Lunch", icon: Utensils, items: [] },
    { category: "Tap Houses", icon: Wine, items: [] },
    { category: "Wineries", icon: Wine, items: [] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Compass className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Unforgettable Experiences
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your vacation into an adventure. Discover unique experiences 
            curated by local experts to help you explore, learn, and create lasting memories.
          </p>
        </div>

        {/* Experience Categories */}
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

        {/* Local Favorites Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Local Favorites
          </h2>
          <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Discover the best local spots our guests love to visit. From hidden gems to popular attractions, 
            we've curated the perfect guide to help you experience the area like a local.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {localFavorites.map((favorite, index) => {
              const IconComponent = favorite.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      {favorite.category}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {favorite.items.length === 0 ? 'Coming Soon' : `${favorite.items.length} places`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Featured Experiences */}
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

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse & Select</h3>
              <p className="text-gray-600">Choose from our curated collection of local experiences</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Book & Confirm</h3>
              <p className="text-gray-600">Secure your spot with instant booking confirmation</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Experience & Enjoy</h3>
              <p className="text-gray-600">Meet your guide and create unforgettable memories</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
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
      </div>
    </div>
  );
};

export default Experiences;
