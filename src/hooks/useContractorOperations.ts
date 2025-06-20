
import { useState } from 'react';
import { useWorkOrderManagement, Contractor } from '@/hooks/useWorkOrderManagement';
import { useToast } from '@/hooks/use-toast';

export const useContractorOperations = () => {
  const {
    contractors,
    loading,
    createContractor,
    updateContractor,
    deleteContractor,
    refreshData,
  } = useWorkOrderManagement();

  const { toast } = useToast();
  const [updatingContractors, setUpdatingContractors] = useState<Set<string>>(new Set());

  const handleSaveContractor = async (contractorData: any, editingContractor: Contractor | null) => {
    try {
      if (editingContractor) {
        await updateContractor(editingContractor.id, contractorData);
        toast({
          title: 'Success',
          description: 'Contractor updated successfully',
        });
      } else {
        await createContractor(contractorData);
        toast({
          title: 'Success',
          description: 'Contractor created successfully',
        });
      }
    } catch (error) {
      console.error('Error saving contractor:', error);
    }
  };

  const handleDeleteContractor = async (contractorId: string) => {
    if (confirm('Are you sure you want to delete this contractor?')) {
      await deleteContractor(contractorId);
    }
  };

  const handleToggleContractorStatus = async (contractorId: string, isActive: boolean) => {
    if (updatingContractors.has(contractorId)) return;

    setUpdatingContractors(prev => new Set([...prev, contractorId]));

    try {
      await updateContractor(contractorId, { is_active: isActive });
      toast({
        title: 'Success',
        description: `Contractor ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating contractor status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contractor status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingContractors(prev => {
        const newSet = new Set(prev);
        newSet.delete(contractorId);
        return newSet;
      });
    }
  };

  return {
    contractors,
    loading,
    updatingContractors,
    handleSaveContractor,
    handleDeleteContractor,
    handleToggleContractorStatus,
    refreshData,
  };
};
