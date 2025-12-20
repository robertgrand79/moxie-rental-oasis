
import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { EnhancedButton } from './ui/enhanced-button';

interface EmptyPropertyStateProps {
  onAddProperty: () => void;
}

const EmptyPropertyState = ({ onAddProperty }: EmptyPropertyStateProps) => {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-24 h-24 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Building2 className="h-12 w-12 text-primary-foreground" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-4">No Properties Yet</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
        Start building your portfolio by adding your first property. You can add photos, descriptions, amenities, and booking details.
      </p>
      <EnhancedButton 
        onClick={onAddProperty}
        variant="gradient"
        size="lg"
        icon={<Plus className="h-4 w-4" />}
      >
        Add Your First Property
      </EnhancedButton>
    </div>
  );
};

export default EmptyPropertyState;
