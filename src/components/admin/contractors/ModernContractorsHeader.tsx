
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, UserX, Wrench } from 'lucide-react';
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
  const topSpecialty = topSpecialties.length > 0 ? topSpecialties[0] : null;

  return (
    <div className="space-y-4">
      {/* Title, Stats, and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contractors</h1>
          {/* Inline Stats */}
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="font-medium text-foreground">{totalContractors}</span> Total
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">{activeContractors}</span> Active
            </span>
            <span className="flex items-center gap-1.5">
              <UserX className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-600">{inactiveContractors}</span> Inactive
            </span>
            {topSpecialty && (
              <span className="flex items-center gap-1.5">
                <Wrench className="h-4 w-4" />
                Top: <span className="font-medium text-foreground capitalize">{topSpecialty.specialty}</span>
              </span>
            )}
          </div>
        </div>
        <Button 
          onClick={onCreateContractor} 
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contractor
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-xl p-4 border shadow-sm">
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
