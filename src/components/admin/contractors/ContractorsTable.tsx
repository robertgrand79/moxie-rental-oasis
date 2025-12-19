
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
  Phone,
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

interface ContractorsTableProps {
  contractors: Contractor[];
  onContractorEdit: (contractor: Contractor) => void;
  onContractorView: (contractor: Contractor) => void;
  onDeleteContractor: (contractorId: string) => void;
  onToggleStatus: (contractorId: string, isActive: boolean) => void;
  updatingContractors: Set<string>;
}

const ContractorsTable = ({
  contractors,
  onContractorEdit,
  onContractorView,
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
            : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  if (contractors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No contractors found</h3>
        <p className="text-muted-foreground mb-6">Get started by adding your first contractor.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contractor</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contractors.map((contractor) => {
            const hasEmail = !!contractor.email;
            const hasPhone = !!contractor.phone;

            return (
              <TableRow 
                key={contractor.id} 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => onContractorView(contractor)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{contractor.name}</div>
                    {contractor.company_name && (
                      <div className="text-sm text-muted-foreground">{contractor.company_name}</div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <a 
                        href={`mailto:${contractor.email}`}
                        className="text-primary hover:underline truncate max-w-48"
                      >
                        {contractor.email}
                      </a>
                    </div>
                    {contractor.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`tel:${contractor.phone}`}
                          className="text-primary hover:underline"
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
                      {contractor.specialties.slice(0, 2).map((specialty) => (
                        <Badge 
                          key={specialty}
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {contractor.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{contractor.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                
                <TableCell>
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
                </TableCell>
                
                <TableCell>
                  {contractor.rating ? (
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {renderStars(contractor.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({contractor.rating.toFixed(1)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No rating</span>
                  )}
                </TableCell>
                
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {/* Email button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          disabled={!hasEmail}
                          asChild={hasEmail}
                        >
                          {hasEmail ? (
                            <a href={`mailto:${contractor.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{hasEmail ? 'Send email' : 'No email available'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Call button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          disabled={!hasPhone}
                          asChild={hasPhone}
                        >
                          {hasPhone ? (
                            <a href={`tel:${contractor.phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          ) : (
                            <Phone className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{hasPhone ? 'Call' : 'No phone available'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* More dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onContractorView(contractor)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onContractorEdit(contractor)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
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
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractorsTable;
