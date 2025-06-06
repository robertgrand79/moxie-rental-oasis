
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyPropertyStateProps {
  onAddProperty: () => void;
}

const EmptyPropertyState = ({ onAddProperty }: EmptyPropertyStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg mb-4">No properties added yet</p>
      <Button onClick={onAddProperty}>
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Property
      </Button>
    </div>
  );
};

export default EmptyPropertyState;
