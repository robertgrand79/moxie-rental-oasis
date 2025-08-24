import React, { useState } from 'react';
import { Plus, MapPin, UtensilsCrossed, Trees, Music, ShoppingBag, Bed, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlaces, Place } from '@/hooks/usePlaces';
import PlacesGrid from './PlacesGrid';
import PlacesListView from './PlacesListView';
import PlacesViewToggle from './PlacesViewToggle';
import PlaceForm from './PlaceForm';

const PlacesManager = () => {
  const { places, isLoading } = usePlaces();
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const categories = [
    { value: 'all', label: 'All Places', icon: MapPin },
    { value: 'dining', label: 'Dining', icon: UtensilsCrossed },
    { value: 'outdoor', label: 'Outdoor', icon: Trees },
    { value: 'entertainment', label: 'Entertainment', icon: Music },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { value: 'accommodation', label: 'Accommodation', icon: Bed },
    { value: 'lifestyle', label: 'Lifestyle', icon: Heart },
  ];

  const filteredPlaces = selectedCategory === 'all' 
    ? places 
    : places.filter(place => place.category === selectedCategory);

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingPlace(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPlace(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading places...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Places Management</CardTitle>
            <p className="text-muted-foreground mt-1">
              Manage all your places including restaurants, attractions, activities, and more
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <PlacesViewToggle view={view} onViewChange={setView} />
            <Button onClick={handleAddNew} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Place</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7 h-auto">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex items-center justify-center gap-2 px-2 py-3 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <category.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value} className="mt-6">
                {view === 'grid' ? (
                  <PlacesGrid places={filteredPlaces} onEdit={handleEdit} />
                ) : (
                  <PlacesListView places={filteredPlaces} onEdit={handleEdit} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {isFormOpen && (
        <PlaceForm
          place={editingPlace}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default PlacesManager;