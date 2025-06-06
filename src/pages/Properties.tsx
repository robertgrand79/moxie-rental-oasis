
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, MapPin, Bed, Bath, Users } from 'lucide-react';
import PropertyForm from '@/components/PropertyForm';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  imageUrl?: string;
  hospitableBookingUrl?: string;
  amenities?: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      title: 'Beachfront Villa',
      description: 'Stunning oceanview villa with private beach access',
      location: 'Malibu, CA',
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      pricePerNight: 450,
      imageUrl: '/placeholder.svg',
      hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/1045550',
      amenities: 'WiFi, Pool, Private Beach, Kitchen, Parking'
    },
    {
      id: '2',
      title: 'Mountain Cabin Retreat',
      description: 'Cozy cabin nestled in the mountains with hiking trails',
      location: 'Aspen, CO',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      pricePerNight: 280,
      imageUrl: '/placeholder.svg',
      hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/1045551',
      amenities: 'WiFi, Fireplace, Kitchen, Hiking Access'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const handleAddProperty = () => {
    setShowAddForm(true);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Property form submitted:', data);
    
    // Create new property
    const newProperty: Property = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      location: data.location,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      maxGuests: data.maxGuests,
      pricePerNight: data.pricePerNight,
      hospitableBookingUrl: data.hospitableBookingUrl,
      amenities: data.amenities,
      imageUrl: '/placeholder.svg' // TODO: Handle uploaded photos
    };

    setProperties(prev => [...prev, newProperty]);
    setShowAddForm(false);
    
    toast({
      title: "Property Added",
      description: "Your property has been successfully added to the listings.",
    });
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
  };

  const handleEditProperty = (id: string) => {
    console.log('Edit property:', id);
    // TODO: Implement edit functionality
    toast({
      title: "Edit Property",
      description: "Edit functionality coming soon...",
    });
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(prop => prop.id !== id));
    toast({
      title: "Property Deleted",
      description: "The property has been removed from your listings.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
            <p className="text-gray-600 mt-2">Manage your vacation rental properties</p>
          </div>
          {!showAddForm && (
            <Button onClick={handleAddProperty} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="mb-8">
            <PropertyForm 
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {!showAddForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={property.imageUrl} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{property.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms} bed
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms} bath
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {property.maxGuests} guests
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg">
                      ${property.pricePerNight}<span className="text-sm font-normal text-gray-500">/night</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditProperty(property.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {properties.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No properties added yet</p>
            <Button onClick={handleAddProperty}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
