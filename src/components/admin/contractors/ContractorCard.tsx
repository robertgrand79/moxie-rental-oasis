
import React from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';
import { EnhancedCard, EnhancedCardContent, EnhancedCardFooter, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import ContractorCardHeader from './ContractorCardHeader';
import ContractorContactInfo from './ContractorContactInfo';
import ContractorSpecialties from './ContractorSpecialties';
import ContractorCardFooter from './ContractorCardFooter';

interface ContractorCardProps {
  contractor: Contractor;
  onEdit: (contractor: Contractor) => void;
  onDelete: (contractorId: string) => void;
  onToggleStatus: (contractorId: string, isActive: boolean) => void;
  isUpdating: boolean;
}

const ContractorCard = ({
  contractor,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
}: ContractorCardProps) => {
  return (
    <EnhancedCard 
      variant="elevated" 
      hover={true}
      className="group relative overflow-hidden"
    >
      {/* Status indicator stripe */}
      <div className={`absolute top-0 left-0 w-1 h-full ${
        contractor.is_active ? 'bg-green-500' : 'bg-red-500'
      }`} />

      <EnhancedCardHeader className="pb-3">
        <ContractorCardHeader
          contractor={contractor}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          isUpdating={isUpdating}
        />
      </EnhancedCardHeader>

      <EnhancedCardContent className="space-y-4">
        {/* Contact Information */}
        <ContractorContactInfo
          email={contractor.email}
          phone={contractor.phone}
          address={contractor.address}
        />

        {/* Specialties */}
        {contractor.specialties && contractor.specialties.length > 0 && (
          <ContractorSpecialties specialties={contractor.specialties} />
        )}

        {/* Notes */}
        {contractor.notes && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {contractor.notes}
            </p>
          </div>
        )}
      </EnhancedCardContent>

      <EnhancedCardFooter className="pt-3 border-t">
        <ContractorCardFooter
          contractor={contractor}
          onEdit={onEdit}
        />
      </EnhancedCardFooter>
    </EnhancedCard>
  );
};

export default ContractorCard;
