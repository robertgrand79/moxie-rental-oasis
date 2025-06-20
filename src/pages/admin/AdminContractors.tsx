
import React, { useState } from 'react';
import { useContractorOperations } from '@/hooks/useContractorOperations';
import { useContractorFilters } from '@/hooks/useContractorFilters';
import { useContractorStats } from '@/hooks/useContractorStats';
import ModernContractorsHeader from '@/components/admin/contractors/ModernContractorsHeader';
import ContractorsGrid from '@/components/admin/contractors/ContractorsGrid';
import ContractorSidePanel from '@/components/admin/contractors/ContractorSidePanel';
import LoadingState from '@/components/ui/loading-state';
import { Contractor } from '@/hooks/useWorkOrderManagement';

const AdminContractors = () => {
  const {
    contractors,
    loading,
    updatingContractors,
    handleSaveContractor,
    handleDeleteContractor,
    handleToggleContractorStatus,
    refreshData,
  } = useContractorOperations();

  const {
    statusFilter,
    setStatusFilter,
    specialtyFilter,
    setSpecialtyFilter,
    searchQuery,
    setSearchQuery,
    filteredContractors,
  } = useContractorFilters(contractors);

  const stats = useContractorStats(contractors);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);

  const handleCreateContractor = () => {
    setEditingContractor(null);
    setIsSidePanelOpen(true);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setEditingContractor(null);
  };

  const handleSaveAndClose = async (contractorData: any) => {
    await handleSaveContractor(contractorData, editingContractor);
    handleCloseSidePanel();
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <ModernContractorsHeader
        totalContractors={stats.totalContractors}
        activeContractors={stats.activeContractors}
        inactiveContractors={stats.inactiveContractors}
        topSpecialties={stats.topSpecialties}
        onCreateContractor={handleCreateContractor}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        specialtyFilter={specialtyFilter}
        onSpecialtyFilterChange={setSpecialtyFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refreshData}
      />

      <ContractorsGrid
        contractors={filteredContractors}
        onContractorEdit={handleEditContractor}
        onDeleteContractor={handleDeleteContractor}
        onToggleStatus={handleToggleContractorStatus}
        updatingContractors={updatingContractors}
      />

      <ContractorSidePanel
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        onSave={handleSaveAndClose}
        contractor={editingContractor}
      />
    </div>
  );
};

export default AdminContractors;
