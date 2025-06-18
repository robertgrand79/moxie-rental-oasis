
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Utensils, Coffee, ShoppingBag, Camera, Trees, Building2 } from 'lucide-react';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';

interface POIAllFieldsGeneratorProps {
  onItemsGenerated: (items: any[]) => void;
  existingItems: PointOfInterest[];
  categories: string[];
}

const POIAllFieldsGenerator = ({ onItemsGenerated, existingItems, categories }: POIAllFieldsGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categoryIcons = {
    restaurants: Utensils,
    cafes: Coffee,
    bars: Coffee,
    shopping: ShoppingBag,
    attractions: Camera,
    parks: Trees,
    museums: Building2,
    other: MapPin
  };

  const quickPrompts = [
    {
      title: 'Popular Local Restaurants',
      description: 'Generate a variety of restaurants in Eugene, OR',
      prompt: 'Generate 5 popular restaurants in Eugene, Oregon with diverse cuisines'
    },
    {
      title: 'Outdoor Activities',
      description: 'Parks, trails, and outdoor attractions',
      prompt: 'Generate outdoor activities and parks in Eugene, Oregon for visitors'
    },
    {
      title: 'Cultural Attractions',
      description: 'Museums, galleries, and cultural sites',
      prompt: 'Generate cultural attractions and museums in Eugene, Oregon'
    },
    {
      title: 'Shopping & Entertainment',
      description: 'Shopping centers, entertainment venues',
      prompt: 'Generate shopping and entertainment venues in Eugene, Oregon'
    }
  ];

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation - replace with actual AI call
      const generatedItems = [
        {
          name: 'Generated POI 1',
          description: 'AI generated point of interest description',
          address: '123 Generated St, Eugene, OR',
          category: selectedCategories[0] || 'restaurants',
          rating: 4.5,
          phone: '(541) 555-0123',
          website_url: 'https://example.com',
          image_url: '',
          latitude: 44.0521,
          longitude: -123.0868,
          price_level: 2,
          distance_from_properties: 1.5,
          driving_time: 5,
          walking_time: 15,
          is_featured: false,
          is_active: true,
          display_order: 0,
          status: 'draft'
        }
      ];

      setTimeout(() => {
        onItemsGenerated(generatedItems);
        setIsGenerating(false);
        setCustomPrompt('');
      }, 2000);
    } catch (error) {
      console.error('Error generating POIs:', error);
      setIsGenerating(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI POI Generator
          </CardTitle>
          <CardDescription>
            Generate multiple points of interest at once using AI. Perfect for quickly populating your database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Select Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons] || MapPin;
                const isSelected = selectedCategories.includes(category);
                return (
                  <Badge
                    key={category}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer flex items-center gap-1 px-3 py-1"
                    onClick={() => toggleCategory(category)}
                  >
                    <Icon className="h-3 w-3" />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Quick Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickPrompts.map((template, index) => (
                <Card key={index} className="cursor-pointer border-2 hover:border-blue-300 transition-colors">
                  <CardContent className="p-4" onClick={() => handleGenerate(template.prompt)}>
                    <h5 className="font-medium text-sm">{template.title}</h5>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Custom Prompt</h4>
            <Textarea
              placeholder="Describe the types of POIs you want to generate..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
            <Button
              onClick={() => handleGenerate(customPrompt)}
              disabled={!customPrompt.trim() || isGenerating}
              className="mt-3"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate POIs
                </>
              )}
            </Button>
          </div>

          {existingItems.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You have {existingItems.length} existing POIs. 
                The AI will generate new ones that complement your current collection.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default POIAllFieldsGenerator;
