
import React from 'react';
import PropertyCard from './PropertyCard';
import { Property } from '@/types/property';

interface PropertyListProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
}

const PropertyList = ({ properties, onEdit, onDelete }: PropertyListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onEdit={() => onEdit(property)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default PropertyList;
