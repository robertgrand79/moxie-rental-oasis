
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Mail, Phone } from 'lucide-react';
import { Contractor } from '@/hooks/useWorkOrderManagement';

interface ContractorCardFooterProps {
  contractor: Contractor;
  onEdit: (contractor: Contractor) => void;
}

const ContractorCardFooter = ({
  contractor,
  onEdit,
}: ContractorCardFooterProps) => {
  return (
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
  );
};

export default ContractorCardFooter;
