
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { contractorService } from '@/services/contractorService';

export interface Contractor {
  id: string;
  name: string;
  company_name?: string;
  email: string;
  phone?: string;
  specialties?: string[];
  address?: string;
  rating?: number;
  is_active: boolean;
  sms_opt_in?: boolean;
  notes?: string;
  // Billing fields
  hourly_rate?: number;
  default_billing_type?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useContractorManagement = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const { toast } = useToast();

  const fetchContractors = async () => {
    try {
      const data = await contractorService.fetchAll();
      setContractors(data);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contractors',
        variant: 'destructive',
      });
    }
  };

  const createContractor = async (contractorData: Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const data = await contractorService.create(contractorData);
      setContractors(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Contractor created successfully',
      });
      return data;
    } catch (error) {
      console.error('Error creating contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to create contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateContractor = async (contractorId: string, updates: Partial<Contractor>) => {
    try {
      const data = await contractorService.update(contractorId, updates);
      setContractors(prev => prev.map(contractor => 
        contractor.id === contractorId ? data : contractor
      ));
      toast({
        title: 'Success',
        description: 'Contractor updated successfully',
      });
      return data;
    } catch (error) {
      console.error('Error updating contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteContractor = async (contractorId: string) => {
    try {
      await contractorService.delete(contractorId);
      setContractors(prev => prev.filter(contractor => contractor.id !== contractorId));
      toast({
        title: 'Success',
        description: 'Contractor deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    contractors,
    setContractors,
    fetchContractors,
    createContractor,
    updateContractor,
    deleteContractor,
  };
};
