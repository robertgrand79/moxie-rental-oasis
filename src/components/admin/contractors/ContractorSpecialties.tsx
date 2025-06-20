
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ContractorSpecialtiesProps {
  specialties: string[];
}

const ContractorSpecialties = ({ specialties }: ContractorSpecialtiesProps) => {
  const specialtyColors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
  ];

  const getSpecialtyColor = (index: number) => {
    return specialtyColors[index % specialtyColors.length];
  };

  if (!specialties || specialties.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
      <div className="flex flex-wrap gap-1">
        {specialties.slice(0, 3).map((specialty, index) => (
          <Badge 
            key={specialty}
            className={`text-xs ${getSpecialtyColor(index)}`}
            variant="outline"
          >
            {specialty}
          </Badge>
        ))}
        {specialties.length > 3 && (
          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
            +{specialties.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ContractorSpecialties;
