
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Utensils, Coffee, Wine, Baby, ShoppingCart } from 'lucide-react';

const LocalFavorites = () => {
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
  );
};

export default LocalFavorites;
