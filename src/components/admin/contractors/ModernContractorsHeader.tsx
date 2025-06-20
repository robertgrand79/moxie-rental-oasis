
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ContractorStatsCards from './ContractorStatsCards';
import ContractorSearchFilters from './ContractorSearchFilters';
import ContractorViewControls from './ContractorViewControls';

interface ModernContractorsHeaderProps {
  totalContractors: number;
  activeContractors: number;
  inactiveContractors: number;
  topSpecialties: Array<{ specialty: string; count: number }>;
  onCreateContractor: () => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  specialtyFilter: string;
  onSpecialtyFilterChange: (specialty: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onRefresh: () => void;
}

const ModernContractorsHeader = ({
  totalContractors,
  activeContractors,
  inactiveContractors,
  topSpecialties,
  onCreateContractor,
  statusFilter,
  onStatusFilterChange,
  specialtyFilter,
  onSpecialtyFilterChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
}: ModernContractorsHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Title and Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-1">Manage your contractor network</p>
        </div>
        <Button onClick={onCreateContractor} size="lg" className="shadow-lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Contractor
        </Button>
      </div>

      {/* Stats Cards */}
      <ContractorStatsCards
        totalContractors={totalContractors}
        activeContractors={activeContractors}
        inactiveContractors={inactiveContractors}
        topSpecialties={topSpecialties}
      />

      {/* Controls */}
      <div className="bg-white rounded-xl p-4 border shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <ContractorSearchFilters
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            specialtyFilter={specialtyFilter}
            onSpecialtyFilterChange={onSpecialtyFilterChange}
          />

          <ContractorViewControls
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernContractorsHeader;
