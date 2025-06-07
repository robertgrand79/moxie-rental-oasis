
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, MapPin, Star, Clock } from 'lucide-react';

const Foodie = () => {
  const culinaryExperiences = [
    {
      title: "Private Chef Services",
      description: "Enjoy restaurant-quality meals in the comfort of your vacation rental with our network of professional chefs.",
      location: "Available at select properties",
      rating: 4.9,
      duration: "2-4 hours",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Wine Tasting Tours",
      description: "Explore local vineyards and taste exceptional wines with guided tours in premier wine regions.",
      location: "Napa Valley, Sonoma",
      rating: 4.8,
      duration: "Full day",
      image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Cooking Classes",
      description: "Learn to prepare local specialties with hands-on cooking classes led by expert culinary instructors.",
      location: "Multiple locations",
      rating: 4.7,
      duration: "3-4 hours",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Farm-to-Table Experiences",
      description: "Visit local farms, harvest fresh ingredients, and enjoy meals prepared with produce you picked yourself.",
      location: "Rural properties",
      rating: 4.9,
      duration: "Half day",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <ChefHat className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Culinary Adventures
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Indulge your passion for food with our curated culinary experiences. From private 
            chefs to wine tastings, discover the flavors that make each destination unique.
          </p>
        </div>

        {/* Featured Experiences */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Featured Culinary Experiences
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {culinaryExperiences.map((experience, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img 
                    src={experience.image} 
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{experience.title}</CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {experience.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{experience.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {experience.rating}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {experience.duration}
                    </div>
                  </div>

                  <Button className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Restaurant Partners */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Restaurant Partners
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Michelin-Starred</h3>
              <p className="text-gray-600">Access to reservations at exclusive restaurants</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Local Favorites</h3>
              <p className="text-gray-600">Hidden gems recommended by locals</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Delivery Partners</h3>
              <p className="text-gray-600">Gourmet meals delivered to your rental</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Taste the World?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book your next culinary adventure and discover the flavors that make 
            each destination unforgettable.
          </p>
          <Button size="lg" className="px-8">
            Explore Properties with Culinary Experiences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Foodie;
