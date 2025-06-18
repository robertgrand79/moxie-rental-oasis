
import React, { useState } from 'react';
import { useWorkOrderManagement, Contractor } from '@/hooks/useWorkOrderManagement';
import ContractorsTable from '@/components/admin/workorders/ContractorsTable';
import CreateContractorModal from '@/components/admin/workorders/CreateContractorModal';
import EditContractorModal from '@/components/admin/workorders/EditContractorModal';
import LoadingState from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const AdminContractors = () => {
  const {
    contractors,
    loading,
    createContractor,
    updateContractor,
    deleteContractor,
  } = useWorkOrderManagement();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);

  const handleCreateContractor = async (contractorData: any) => {
    await createContractor(contractorData);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setIsEditModalOpen(true);
  };

  const handleUpdateContractor = async (contractorId: string, contractorData: any) => {
    await updateContractor(contractorId, contractorData);
  };

  const handleDeleteContractor = async (contractorId: string) => {
    await deleteContractor(contractorId);
  };

  const handleToggleContractorStatus = async (contractorId: string, isActive: boolean) => {
    await updateContractor(contractorId, { is_active: isActive });
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contractor Management</h1>
          <p className="text-gray-600">Manage your contractors and their information</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contractor
        </Button>
      </div>

      <ContractorsTable
        contractors={contractors}
        onEditContractor={handleEditContractor}
        onDeleteContractor={handleDeleteContractor}
        onToggleStatus={handleToggleContractorStatus}
      />

      <CreateContractorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateContractor={handleCreateContractor}
      />

      <EditContractorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingContractor(null);
        }}
        onUpdateContractor={handleUpdateContractor}
        contractor={editingContractor}
      />
    </div>
  );
};

export default AdminContractors;
