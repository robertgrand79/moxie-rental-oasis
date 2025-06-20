
import { useState, useMemo } from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';

export const useContractorFilters = (contractors: Contractor[]) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredContractors = useMemo(() => {
    return contractors.filter(contractor => {
      if (statusFilter === 'active' && !contractor.is_active) return false;
      if (statusFilter === 'inactive' && contractor.is_active) return false;
      
      if (specialtyFilter !== 'all') {
        if (!contractor.specialties?.includes(specialtyFilter)) return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          contractor.name.toLowerCase().includes(query) ||
          contractor.company_name?.toLowerCase().includes(query) ||
          contractor.email.toLowerCase().includes(query) ||
          contractor.phone?.toLowerCase().includes(query) ||
          contractor.specialties?.some(specialty => 
            specialty.toLowerCase().includes(query)
          )
        );
      }
      
      return true;
    });
  }, [contractors, statusFilter, specialtyFilter, searchQuery]);

  return {
    statusFilter,
    setStatusFilter,
    specialtyFilter,
    setSpecialtyFilter,
    searchQuery,
    setSearchQuery,
    filteredContractors,
  };
};
