
import React from 'react';

interface EmptyPropertyStateProps {
  onAddProperty: () => void;
}

const EmptyPropertyState = ({ onAddProperty }: EmptyPropertyStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg mb-4">No properties added yet</p>
      <p className="text-gray-400 text-sm">Click the "Add Property" button above to get started</p>
    </div>
  );
};

export default EmptyPropertyState;
