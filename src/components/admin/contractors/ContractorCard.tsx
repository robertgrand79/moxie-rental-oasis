
import React from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';
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
  Phone,
  MapPin,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContractorCardProps {
  contractor: Contractor;
  onEdit: (contractor: Contractor) => void;
  onView: (contractor: Contractor) => void;
  onDelete: (contractorId: string) => void;
  onToggleStatus: (contractorId: string, isActive: boolean) => void;
  isUpdating: boolean;
}

const ContractorCard = ({
  contractor,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  isUpdating,
}: ContractorCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  const hasEmail = !!contractor.email;
  const hasPhone = !!contractor.phone;

  return (
    <div 
      className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={() => onView(contractor)}
    >
      {/* Status indicator stripe */}
      <div className={`h-1 w-full ${
        contractor.is_active ? 'bg-green-500' : 'bg-red-500'
      }`} />

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Status and Rating row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  contractor.is_active 
                    ? 'border-green-200 bg-green-50 text-green-700' 
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
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
                <div className="flex items-center gap-0.5">
                  {renderStars(contractor.rating)}
                  <span className="text-xs text-muted-foreground ml-1">
                    {contractor.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Name and Company */}
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {contractor.name}
            </h3>
            {contractor.company_name && (
              <p className="text-sm text-muted-foreground truncate">
                {contractor.company_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 space-y-3">
        {/* Contact Info - Compact */}
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{contractor.email}</span>
          </div>
          {contractor.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{contractor.phone}</span>
            </div>
          )}
          {contractor.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{contractor.address}</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        {contractor.specialties && contractor.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contractor.specialties.slice(0, 3).map((specialty) => (
              <Badge 
                key={specialty}
                variant="secondary"
                className="text-xs capitalize"
              >
                {specialty}
              </Badge>
            ))}
            {contractor.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contractor.specialties.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Notes - truncated */}
        {contractor.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {contractor.notes}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-t bg-muted/30" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {/* Email button - always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                disabled={!hasEmail}
                asChild={hasEmail}
              >
                {hasEmail ? (
                  <a href={`mailto:${contractor.email}`}>
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Email
                  </a>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Email
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {!hasEmail && (
              <TooltipContent>
                <p>No email available</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* Call button - always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                disabled={!hasPhone}
                asChild={hasPhone}
              >
                {hasPhone ? (
                  <a href={`tel:${contractor.phone}`}>
                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                    Call
                  </a>
                ) : (
                  <>
                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                    Call
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {!hasPhone && (
              <TooltipContent>
                <p>No phone available</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
        
        {/* More dropdown with View, Edit, Activate/Deactivate, Delete */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onView(contractor)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(contractor)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
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
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ContractorCard;
