
import React, { useState } from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Star,
  Search,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ContractorsTableProps {
  contractors: Contractor[];
  onEditContractor: (contractor: Contractor) => void;
  onDeleteContractor: (contractorId: string) => void;
  onToggleStatus: (contractorId: string, isActive: boolean) => void;
}

const ContractorsTable = ({ 
  contractors, 
  onEditContractor, 
  onDeleteContractor,
  onToggleStatus 
}: ContractorsTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContractors = contractors.filter(contractor =>
    contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contractor.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contractor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contractor.specialties?.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contractors Database</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContractors.map((contractor) => (
              <TableRow key={contractor.id}>
                <TableCell className="font-medium">{contractor.name}</TableCell>
                <TableCell>{contractor.company_name || '-'}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-1 text-gray-400" />
                      {contractor.email}
                    </div>
                    {contractor.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {contractor.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contractor.specialties?.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    )) || '-'}
                    {contractor.specialties && contractor.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{contractor.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {contractor.rating ? (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{contractor.rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(contractor.id, !contractor.is_active)}
                      className="p-1"
                    >
                      {contractor.is_active ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Badge variant={contractor.is_active ? "default" : "secondary"}>
                      {contractor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditContractor(contractor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Contractor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {contractor.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDeleteContractor(contractor.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredContractors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'No contractors found matching your search.' : 'No contractors found.'}
        </div>
      )}
    </div>
  );
};

export default ContractorsTable;
