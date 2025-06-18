
import React from 'react';
import PropertyList from '@/components/PropertyList';
import EmptyPropertyState from '@/components/EmptyPropertyState';
import { Property } from '@/types/property';

interface PropertyListContainerProps {
  properties: Property[];
  deletingProperties: Set<string>;
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => Promise<void>;
  onAddProperty: () => void;
}

const PropertyListContainer = ({
  properties,
  deletingProperties,
  onEdit,
  onDelete,
  onAddProperty
}: PropertyListContainerProps) => {
  // Ensure properties is always an array
  const safeProperties = Array.isArray(properties) ? properties : [];
  
  return (
    <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
      {safeProperties.length > 0 ? (
        <PropertyList
          properties={safeProperties}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={true}
          deletingProperties={deletingProperties}
        />
      ) : (
        <EmptyPropertyState onAddProperty={onAddProperty} />
      )}
    </div>
  );
};

export default PropertyListContainer;
