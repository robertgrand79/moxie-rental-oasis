import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlaces, Place } from '@/hooks/usePlaces';
import PlacesGrid from './PlacesGrid';
import PlaceForm from './PlaceForm';

const PlacesManager = () => {
  const { places, isLoading } = usePlaces();
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Places' },
    { value: 'dining', label: 'Dining' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'lifestyle', label: 'Lifestyle' },
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
          <Button onClick={handleAddNew} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Place</span>
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value} className="mt-6">
                <PlacesGrid 
                  places={filteredPlaces} 
                  onEdit={handleEdit}
                />
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