import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Home,
  Shield,
  Wifi,
  MapPin,
  Phone,
  Utensils,
  Activity,
  ShoppingBag,
  Car
} from 'lucide-react';
import { GuidebookContent } from '@/hooks/useGuidebookManagement';

interface GuidebookEditorProps {
  initialContent?: GuidebookContent;
  propertyTitle: string;
  onSave: (content: GuidebookContent, title: string) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const GuidebookEditor = ({ 
  initialContent, 
  propertyTitle,
  onSave, 
  onCancel,
  isSaving 
}: GuidebookEditorProps) => {
  const [title, setTitle] = useState(`${propertyTitle} Guidebook`);
  const [content, setContent] = useState<GuidebookContent>(initialContent || {
    welcome_message: '',
    check_in_instructions: '',
    check_out_instructions: '',
    house_rules: [],
    amenities: [],
    wifi: { network: '', password: '' },
    local_recommendations: {
      restaurants: [],
      activities: [],
      shopping: [],
      transportation: {
        airport: '',
        parking: '',
        public_transit: [],
        rideshare: ['Uber', 'Lyft']
      }
    },
    emergency_contacts: []
  });

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const updateContent = (updates: Partial<GuidebookContent>) => {
    setContent(prev => ({ ...prev, ...updates }));
  };

  // House Rules management
  const [newRule, setNewRule] = useState('');
  const addHouseRule = () => {
    if (newRule.trim()) {
      updateContent({ house_rules: [...(content.house_rules || []), newRule.trim()] });
      setNewRule('');
    }
  };
  const removeHouseRule = (index: number) => {
    updateContent({ house_rules: content.house_rules?.filter((_, i) => i !== index) });
  };

  // Amenities management
  const [newAmenity, setNewAmenity] = useState('');
  const addAmenity = () => {
    if (newAmenity.trim()) {
      updateContent({ amenities: [...(content.amenities || []), newAmenity.trim()] });
      setNewAmenity('');
    }
  };
  const removeAmenity = (index: number) => {
    updateContent({ amenities: content.amenities?.filter((_, i) => i !== index) });
  };

  // Restaurant management
  const addRestaurant = () => {
    const restaurants = content.local_recommendations?.restaurants || [];
    updateContent({
      local_recommendations: {
        ...content.local_recommendations,
        restaurants: [...restaurants, { name: '', type: '', distance: '', rating: 0, description: '', phone: '', website: '' }]
      }
    });
  };
  const updateRestaurant = (index: number, updates: any) => {
    const restaurants = [...(content.local_recommendations?.restaurants || [])];
    restaurants[index] = { ...restaurants[index], ...updates };
    updateContent({
      local_recommendations: { ...content.local_recommendations, restaurants }
    });
  };
  const removeRestaurant = (index: number) => {
    updateContent({
      local_recommendations: {
        ...content.local_recommendations,
        restaurants: content.local_recommendations?.restaurants?.filter((_, i) => i !== index)
      }
    });
  };

  // Activity management
  const addActivity = () => {
    const activities = content.local_recommendations?.activities || [];
    updateContent({
      local_recommendations: {
        ...content.local_recommendations,
        activities: [...activities, { name: '', type: '', distance: '', description: '', hours: '', website: '' }]
      }
    });
  };
  const updateActivity = (index: number, updates: any) => {
    const activities = [...(content.local_recommendations?.activities || [])];
    activities[index] = { ...activities[index], ...updates };
    updateContent({
      local_recommendations: { ...content.local_recommendations, activities }
    });
  };
  const removeActivity = (index: number) => {
    updateContent({
      local_recommendations: {
        ...content.local_recommendations,
        activities: content.local_recommendations?.activities?.filter((_, i) => i !== index)
      }
    });
  };

  // Shopping management
  const addShopping = () => {
    const shopping = content.local_recommendations?.shopping || [];
    updateContent({
      local_recommendations: {
        ...content.local_recommendations,
        shopping: [...shopping, { name: '', type: '', distance: '', description: '', hours: '' }]
      }
    });
  };
  const updateShopping = (index: number, updates: any) => {
    const shopping = [...(content.local_recommendations?.shopping || [])];
    shopping[index] = { ...shopping[index], ...updates };
    updateContent({
      local_recommendations: { ...content.local_recommendations, shopping }
    });
  };
  const removeShopping = (index: number) => {
    updateContent({
      local_recommendations: {
        ...content.local_recommendations,
        shopping: content.local_recommendations?.shopping?.filter((_, i) => i !== index)
      }
    });
  };

  // Emergency contacts management
  const addEmergencyContact = () => {
    updateContent({
      emergency_contacts: [...(content.emergency_contacts || []), { name: '', role: '', phone: '', available: '24/7' }]
    });
  };
  const updateEmergencyContact = (index: number, updates: any) => {
    const contacts = [...(content.emergency_contacts || [])];
    contacts[index] = { ...contacts[index], ...updates };
    updateContent({ emergency_contacts: contacts });
  };
  const removeEmergencyContact = (index: number) => {
    updateContent({ emergency_contacts: content.emergency_contacts?.filter((_, i) => i !== index) });
  };

  // Public transit management
  const [newTransit, setNewTransit] = useState('');
  const addTransit = () => {
    if (newTransit.trim()) {
      const transit = content.local_recommendations?.transportation?.public_transit || [];
      updateContent({
        local_recommendations: {
          ...content.local_recommendations,
          transportation: {
            ...content.local_recommendations?.transportation,
            airport: content.local_recommendations?.transportation?.airport || '',
            parking: content.local_recommendations?.transportation?.parking || '',
            public_transit: [...transit, newTransit.trim()],
            rideshare: content.local_recommendations?.transportation?.rideshare || []
          }
        }
      });
      setNewTransit('');
    }
  };
  const removeTransit = (index: number) => {
    updateContent({
      local_recommendations: {
        ...content.local_recommendations,
        transportation: {
          ...content.local_recommendations?.transportation,
          airport: content.local_recommendations?.transportation?.airport || '',
          parking: content.local_recommendations?.transportation?.parking || '',
          public_transit: content.local_recommendations?.transportation?.public_transit?.filter((_, i) => i !== index) || [],
          rideshare: content.local_recommendations?.transportation?.rideshare || []
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Edit Guidebook</h2>
            <p className="text-sm text-muted-foreground">{propertyTitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(content, title)} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Guidebook'}
          </Button>
        </div>
      </div>

      {/* Guidebook Title */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Guidebook Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Property Name Guidebook"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="welcome" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="welcome" className="gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Welcome</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Rules</span>
          </TabsTrigger>
          <TabsTrigger value="amenities" className="gap-2">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Amenities</span>
          </TabsTrigger>
          <TabsTrigger value="local" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Local</span>
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Emergency</span>
          </TabsTrigger>
        </TabsList>

        {/* Welcome Tab */}
        <TabsContent value="welcome" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Message</CardTitle>
              <CardDescription>Greet your guests with a warm welcome</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.welcome_message || ''}
                onChange={(e) => updateContent({ welcome_message: e.target.value })}
                placeholder="Welcome to our beautiful home! We're so excited to have you as our guest..."
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Check-in Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content.check_in_instructions || ''}
                  onChange={(e) => updateContent({ check_in_instructions: e.target.value })}
                  placeholder="Check-in is at 4:00 PM. The door code is..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Check-out Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content.check_out_instructions || ''}
                  onChange={(e) => updateContent({ check_out_instructions: e.target.value })}
                  placeholder="Check-out is at 11:00 AM. Please lock all doors..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* House Rules Tab */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>House Rules</CardTitle>
              <CardDescription>Set expectations for your guests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Add a house rule..."
                  onKeyPress={(e) => e.key === 'Enter' && addHouseRule()}
                />
                <Button onClick={addHouseRule} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {content.house_rules?.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="flex-1">{rule}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHouseRule(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {(!content.house_rules || content.house_rules.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No house rules added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amenities Tab */}
        <TabsContent value="amenities" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>WiFi Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Network Name</Label>
                <Input
                  value={content.wifi?.network || ''}
                  onChange={(e) => updateContent({ wifi: { ...content.wifi!, network: e.target.value, password: content.wifi?.password || '' } })}
                  placeholder="MyWiFiNetwork"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  value={content.wifi?.password || ''}
                  onChange={(e) => updateContent({ wifi: { ...content.wifi!, network: content.wifi?.network || '', password: e.target.value } })}
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>List what's available at the property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add an amenity..."
                  onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                />
                <Button onClick={addAmenity} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {content.amenities?.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 pr-1">
                    {amenity}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1"
                      onClick={() => removeAmenity(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Local Recommendations Tab */}
        <TabsContent value="local" className="space-y-4 mt-4">
          {/* Restaurants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Restaurants
                </CardTitle>
              </div>
              <Button size="sm" onClick={addRestaurant}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.local_recommendations?.restaurants?.map((restaurant, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="grid gap-3 md:grid-cols-3 flex-1">
                      <Input
                        placeholder="Restaurant name"
                        value={restaurant.name}
                        onChange={(e) => updateRestaurant(index, { name: e.target.value })}
                      />
                      <Input
                        placeholder="Type (e.g., Italian)"
                        value={restaurant.type}
                        onChange={(e) => updateRestaurant(index, { type: e.target.value })}
                      />
                      <Input
                        placeholder="Distance (e.g., 0.5 miles)"
                        value={restaurant.distance}
                        onChange={(e) => updateRestaurant(index, { distance: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRestaurant(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={restaurant.description}
                    onChange={(e) => updateRestaurant(index, { description: e.target.value })}
                  />
                  <div className="grid gap-3 md:grid-cols-3">
                    <Input
                      placeholder="Phone"
                      value={restaurant.phone || ''}
                      onChange={(e) => updateRestaurant(index, { phone: e.target.value })}
                    />
                    <Input
                      placeholder="Website URL"
                      value={restaurant.website || ''}
                      onChange={(e) => updateRestaurant(index, { website: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Rating (1-5)"
                      value={restaurant.rating || ''}
                      onChange={(e) => updateRestaurant(index, { rating: parseFloat(e.target.value) || 0 })}
                      min="1"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>
              ))}
              {(!content.local_recommendations?.restaurants || content.local_recommendations.restaurants.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No restaurants added yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activities & Attractions
                </CardTitle>
              </div>
              <Button size="sm" onClick={addActivity}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.local_recommendations?.activities?.map((activity, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="grid gap-3 md:grid-cols-3 flex-1">
                      <Input
                        placeholder="Activity name"
                        value={activity.name}
                        onChange={(e) => updateActivity(index, { name: e.target.value })}
                      />
                      <Input
                        placeholder="Type (e.g., Hiking)"
                        value={activity.type}
                        onChange={(e) => updateActivity(index, { type: e.target.value })}
                      />
                      <Input
                        placeholder="Distance"
                        value={activity.distance}
                        onChange={(e) => updateActivity(index, { distance: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeActivity(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={activity.description}
                    onChange={(e) => updateActivity(index, { description: e.target.value })}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      placeholder="Hours (e.g., 9 AM - 5 PM)"
                      value={activity.hours || ''}
                      onChange={(e) => updateActivity(index, { hours: e.target.value })}
                    />
                    <Input
                      placeholder="Website URL"
                      value={activity.website || ''}
                      onChange={(e) => updateActivity(index, { website: e.target.value })}
                    />
                  </div>
                </div>
              ))}
              {(!content.local_recommendations?.activities || content.local_recommendations.activities.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activities added yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Shopping */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Shopping & Services
                </CardTitle>
              </div>
              <Button size="sm" onClick={addShopping}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.local_recommendations?.shopping?.map((shop, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="grid gap-3 md:grid-cols-3 flex-1">
                      <Input
                        placeholder="Store name"
                        value={shop.name}
                        onChange={(e) => updateShopping(index, { name: e.target.value })}
                      />
                      <Input
                        placeholder="Type (e.g., Grocery)"
                        value={shop.type}
                        onChange={(e) => updateShopping(index, { type: e.target.value })}
                      />
                      <Input
                        placeholder="Distance"
                        value={shop.distance}
                        onChange={(e) => updateShopping(index, { distance: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeShopping(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={shop.description}
                    onChange={(e) => updateShopping(index, { description: e.target.value })}
                  />
                  <Input
                    placeholder="Hours"
                    value={shop.hours || ''}
                    onChange={(e) => updateShopping(index, { hours: e.target.value })}
                  />
                </div>
              ))}
              {(!content.local_recommendations?.shopping || content.local_recommendations.shopping.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No shopping locations added yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Transportation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Transportation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nearest Airport</Label>
                  <Input
                    value={content.local_recommendations?.transportation?.airport || ''}
                    onChange={(e) => updateContent({
                      local_recommendations: {
                        ...content.local_recommendations,
                        transportation: {
                          ...content.local_recommendations?.transportation,
                          airport: e.target.value,
                          parking: content.local_recommendations?.transportation?.parking || '',
                          public_transit: content.local_recommendations?.transportation?.public_transit || [],
                          rideshare: content.local_recommendations?.transportation?.rideshare || []
                        }
                      }
                    })}
                    placeholder="e.g., Eugene Airport (EUG) - 15 min drive"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parking Information</Label>
                  <Input
                    value={content.local_recommendations?.transportation?.parking || ''}
                    onChange={(e) => updateContent({
                      local_recommendations: {
                        ...content.local_recommendations,
                        transportation: {
                          ...content.local_recommendations?.transportation,
                          airport: content.local_recommendations?.transportation?.airport || '',
                          parking: e.target.value,
                          public_transit: content.local_recommendations?.transportation?.public_transit || [],
                          rideshare: content.local_recommendations?.transportation?.rideshare || []
                        }
                      }
                    })}
                    placeholder="e.g., Free parking in driveway"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Public Transit Options</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTransit}
                    onChange={(e) => setNewTransit(e.target.value)}
                    placeholder="Add transit option..."
                    onKeyPress={(e) => e.key === 'Enter' && addTransit()}
                  />
                  <Button onClick={addTransit} type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {content.local_recommendations?.transportation?.public_transit?.map((transit, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pr-1">
                      {transit}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => removeTransit(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contacts Tab */}
        <TabsContent value="emergency" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>Important contacts for your guests</CardDescription>
              </div>
              <Button size="sm" onClick={addEmergencyContact}>
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.emergency_contacts?.map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 flex-1">
                      <Input
                        placeholder="Name"
                        value={contact.name}
                        onChange={(e) => updateEmergencyContact(index, { name: e.target.value })}
                      />
                      <Input
                        placeholder="Role (e.g., Property Manager)"
                        value={contact.role}
                        onChange={(e) => updateEmergencyContact(index, { role: e.target.value })}
                      />
                      <Input
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) => updateEmergencyContact(index, { phone: e.target.value })}
                      />
                      <Input
                        placeholder="Availability (e.g., 24/7)"
                        value={contact.available}
                        onChange={(e) => updateEmergencyContact(index, { available: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmergencyContact(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!content.emergency_contacts || content.emergency_contacts.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No emergency contacts added yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Standard emergency numbers (911, 311, 211) are automatically displayed to guests.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuidebookEditor;
