
import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { EnhancedButton } from './ui/enhanced-button';

interface EmptyPropertyStateProps {
  onAddProperty: () => void;
}

const EmptyPropertyState = ({ onAddProperty }: EmptyPropertyStateProps) => {
  return (
    <div className="text-center py-24 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto mb-6">
        <Building2 className="h-9 w-9" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium tracking-tight text-foreground mt-4">No Properties Yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm leading-relaxed">
        Start building your portfolio by adding your first property. You can add photos, descriptions, amenities, and booking details.
      </p>
      <div className="mt-8">
        <EnhancedButton 
          onClick={onAddProperty}
          variant="gradient"
          size="lg"
          className="rounded-full shadow-sm hover:-translate-y-0.5 transition-all"
          icon={<Plus className="h-4 w-4" strokeWidth={1.5} />}
        >
          Add Your First Property
        </EnhancedButton>
      </div>
    </div>
  );
};

export default EmptyPropertyState;
