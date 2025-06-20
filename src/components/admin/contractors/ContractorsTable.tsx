
import React from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical,
  Star,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContractorsTableProps {
  contractors: Contractor[];
  onContractorEdit: (contractor: Contractor) => void;
  onDeleteContractor: (contractorId: string) => void;
  onToggleStatus: (contractorId: string, isActive: boolean) => void;
  updatingContractors: Set<string>;
}

const ContractorsTable = ({
  contractors,
  onContractorEdit,
  onDeleteContractor,
  onToggleStatus,
  updatingContractors,
}: ContractorsTableProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

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
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contractor</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contractors.map((contractor) => (
            <TableRow key={contractor.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{contractor.name}</div>
                  {contractor.company_name && (
                    <div className="text-sm text-gray-500">{contractor.company_name}</div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <a 
                      href={`mailto:${contractor.email}`}
                      className="text-blue-600 hover:text-blue-800 truncate max-w-48"
                    >
                      {contractor.email}
                    </a>
                  </div>
                  {contractor.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <a 
                        href={`tel:${contractor.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {contractor.phone}
                      </a>
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {contractor.specialties && contractor.specialties.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {contractor.specialties.slice(0, 2).map((specialty, index) => (
                      <Badge 
                        key={specialty}
                        variant="outline"
                        className="text-xs"
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {contractor.specialties.length > 2 && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                        +{contractor.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">None</span>
                )}
              </TableCell>
              
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={contractor.is_active ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'}
                >
                  {contractor.is_active ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </TableCell>
              
              <TableCell>
                {contractor.rating ? (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {renderStars(contractor.rating)}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      ({contractor.rating.toFixed(1)})
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No rating</span>
                )}
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onContractorEdit(contractor)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onToggleStatus(contractor.id, !contractor.is_active)}
                      disabled={updatingContractors.has(contractor.id)}
                    >
                      {contractor.is_active ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteContractor(contractor.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractorsTable;
