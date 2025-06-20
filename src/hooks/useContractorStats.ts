
import { useMemo } from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';

export const useContractorStats = (contractors: Contractor[]) => {
  const stats = useMemo(() => {
    const totalContractors = contractors.length;
    const activeContractors = contractors.filter(c => c.is_active).length;
    const inactiveContractors = contractors.filter(c => !c.is_active).length;
    
    // Calculate specialty breakdown
    const specialtyCount = contractors.reduce((acc, contractor) => {
      contractor.specialties?.forEach(specialty => {
        acc[specialty] = (acc[specialty] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topSpecialties = Object.entries(specialtyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([specialty, count]) => ({ specialty, count }));
    
    return {
      totalContractors,
      activeContractors,
      inactiveContractors,
      topSpecialties,
    };
  }, [contractors]);

  return stats;
};
