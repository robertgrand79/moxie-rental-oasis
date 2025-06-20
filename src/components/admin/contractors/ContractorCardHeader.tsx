
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical,
  Star,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Contractor } from '@/hooks/useWorkOrderManagement';

interface ContractorCardHeaderProps {
  contractor: Contractor;
  onEdit: (contractor: Contractor) => void;
  onDelete: (contractorId: string) => void;
  onToggleStatus: (contractorId: string, isActive: boolean) => void;
  isUpdating: boolean;
}

const ContractorCardHeader = ({
  contractor,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
}: ContractorCardHeaderProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
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
          {contractor.rating && (
            <div className="flex items-center gap-1">
              {renderStars(contractor.rating)}
              <span className="text-sm text-gray-600 ml-1">
                ({contractor.rating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
        <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {contractor.name}
        </h3>
        {contractor.company_name && (
          <p className="text-sm text-gray-600 truncate">
            {contractor.company_name}
          </p>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onEdit(contractor)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onToggleStatus(contractor.id, !contractor.is_active)}
            disabled={isUpdating}
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
            onClick={() => onDelete(contractor.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ContractorCardHeader;
