
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface LifestyleGeneratedItemsListProps {
  generatedItems: any[];
  onItemsGenerated: (items: any[]) => void;
  setGeneratedItems: (items: any[]) => void;
}

const LifestyleGeneratedItemsList = ({
  generatedItems,
  onItemsGenerated,
  setGeneratedItems
}: LifestyleGeneratedItemsListProps) => {
  const handleApplyAll = () => {
    onItemsGenerated(generatedItems);
    setGeneratedItems([]);
    toast({
      title: 'Success',
      description: `Applied ${generatedItems.length} lifestyle items to your gallery!`
    });
  };

  const handleApplySelected = (item: any) => {
    onItemsGenerated([item]);
    setGeneratedItems(prev => prev.filter(i => i !== item));
    toast({
      title: 'Success',
      description: 'Lifestyle item added to your gallery!'
    });
  };

  if (generatedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generated Items</h3>
        <Button onClick={handleApplyAll} variant="default">
          Apply All {generatedItems.length} Items
        </Button>
      </div>
      
      <div className="grid gap-4">
        {generatedItems.map((item, index) => {
          if (!item || !item.title) {
            return null;
          }
          
          return (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    {item.category && <Badge variant="outline">{item.category}</Badge>}
                    {item.is_featured && <Badge>Featured</Badge>}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    {item.location && <p>📍 {item.location}</p>}
                    {item.activity_type && <p>🏃 {item.activity_type}</p>}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleApplySelected(item)}
                  variant="outline"
                >
                  Add This Item
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LifestyleGeneratedItemsList;
