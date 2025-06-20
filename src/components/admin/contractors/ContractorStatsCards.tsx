
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX } from 'lucide-react';

interface ContractorStatsCardsProps {
  totalContractors: number;
  activeContractors: number;
  inactiveContractors: number;
  topSpecialties: Array<{ specialty: string; count: number }>;
}

const ContractorStatsCards = ({
  totalContractors,
  activeContractors,
  inactiveContractors,
  topSpecialties,
}: ContractorStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{totalContractors}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeContractors}</p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-red-600">{inactiveContractors}</p>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <UserX className="h-5 w-5 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Specialty</p>
            <p className="text-lg font-bold text-purple-600">
              {topSpecialties[0]?.specialty || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {topSpecialties[0]?.count || 0} contractors
            </p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Badge className="bg-purple-100 text-purple-800 border-0">★</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorStatsCards;
