
import React from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';
import ContractorCard from './ContractorCard';

interface ContractorsGridProps {
  contractors: Contractor[];
  onContractorEdit: (contractor: Contractor) => void;
  onDeleteContractor: (contractorId: string) => void;
  onToggleStatus: (contractorId: string, isActive: boolean) => void;
  updatingContractors: Set<string>;
}

const ContractorsGrid = ({
  contractors,
  onContractorEdit,
  onDeleteContractor,
  onToggleStatus,
  updatingContractors,
}: ContractorsGridProps) => {
  if (contractors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No contractors found</h3>
        <p className="text-gray-500 mb-6">Get started by adding your first contractor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 px-1">
      {contractors.map((contractor) => (
        <ContractorCard
          key={contractor.id}
          contractor={contractor}
          onEdit={onContractorEdit}
          onDelete={onDeleteContractor}
          onToggleStatus={onToggleStatus}
          isUpdating={updatingContractors.has(contractor.id)}
        />
      ))}
    </div>
  );
};

export default ContractorsGrid;
