
import React from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';
import { EnhancedCard, EnhancedCardContent, EnhancedCardFooter, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  MoreVertical,
  Star,
  MapPin,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContractorCardProps {
  contractor: Contractor;
  onEdit: (contractor: Contractor) => void;
  onDelete: (contractorId: string) => void;
  onToggleStatus: (contractorId: string, isActive: boolean) => void;
  isUpdating: boolean;
}

const ContractorCard = ({
  contractor,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
}: ContractorCardProps) => {
  const specialtyColors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
  ];

  const getSpecialtyColor = (index: number) => {
    return specialtyColors[index % specialtyColors.length];
  };

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
    <EnhancedCard 
      variant="elevated" 
      hover={true}
      className="group relative overflow-hidden"
    >
      {/* Status indicator stripe */}
      <div className={`absolute top-0 left-0 w-1 h-full ${
        contractor.is_active ? 'bg-green-500' : 'bg-red-500'
      }`} />

      <EnhancedCardHeader className="pb-3">
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
      </EnhancedCardHeader>

      <EnhancedCardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <a 
              href={`mailto:${contractor.email}`}
              className="truncate hover:text-blue-600 transition-colors"
            >
              {contractor.email}
            </a>
          </div>
          
          {contractor.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a 
                href={`tel:${contractor.phone}`}
                className="hover:text-blue-600 transition-colors"
              >
                {contractor.phone}
              </a>
            </div>
          )}
          
          {contractor.address && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{contractor.address}</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        {contractor.specialties && contractor.specialties.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
            <div className="flex flex-wrap gap-1">
              {contractor.specialties.slice(0, 3).map((specialty, index) => (
                <Badge 
                  key={specialty}
                  className={`text-xs ${getSpecialtyColor(index)}`}
                  variant="outline"
                >
                  {specialty}
                </Badge>
              ))}
              {contractor.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                  +{contractor.specialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {contractor.notes && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {contractor.notes}
            </p>
          </div>
        )}
      </EnhancedCardContent>

      <EnhancedCardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(contractor)}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          
          <div className="flex items-center gap-2">
            {contractor.email && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="flex items-center gap-1"
              >
                <a href={`mailto:${contractor.email}`}>
                  <Mail className="h-3 w-3" />
                  Email
                </a>
              </Button>
            )}
            
            {contractor.phone && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="flex items-center gap-1"
              >
                <a href={`tel:${contractor.phone}`}>
                  <Phone className="h-3 w-3" />
                  Call
                </a>
              </Button>
            )}
          </div>
        </div>
      </EnhancedCardFooter>
    </EnhancedCard>
  );
};

export default ContractorCard;
