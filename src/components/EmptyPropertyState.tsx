
import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { EnhancedButton } from './ui/enhanced-button';

interface EmptyPropertyStateProps {
  onAddProperty: () => void;
}

const EmptyPropertyState = ({ onAddProperty }: EmptyPropertyStateProps) => {
  return (
    <div className="text-center py-24 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-8">
        <Building2 className="h-9 w-9 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium tracking-tight text-foreground mb-3">No Properties Yet</h3>
      <p className="text-muted-foreground/70 mb-8 max-w-md mx-auto leading-relaxed text-sm">
        Start building your portfolio by adding your first property. You can add photos, descriptions, amenities, and booking details.
      </p>
      <EnhancedButton 
        onClick={onAddProperty}
        variant="gradient"
        size="lg"
        icon={<Plus className="h-4 w-4" strokeWidth={1.5} />}
      >
        Add Your First Property
      </EnhancedButton>
    </div>
  );
};

export default EmptyPropertyState;
