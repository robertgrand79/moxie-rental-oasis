
import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2">
      <EnhancedButton 
        variant="outline" 
        size="sm" 
        onClick={() => onEdit(contractor)}
        className="flex items-center gap-1 min-h-[44px] sm:min-h-auto"
      >
        <Edit className="h-3 w-3" />
        Edit
      </EnhancedButton>
      
      <div className="flex items-center gap-2 flex-wrap">
        {contractor.email && (
          <EnhancedButton 
            variant="outline" 
            size="sm" 
            asChild
            className="flex items-center gap-1 min-h-[44px] sm:min-h-auto"
          >
            <a href={`mailto:${contractor.email}`}>
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">Email</span>
            </a>
          </EnhancedButton>
        )}
        
        {contractor.phone && (
          <EnhancedButton 
            variant="outline" 
            size="sm" 
            asChild
            className="flex items-center gap-1 min-h-[44px] sm:min-h-auto"
          >
            <a href={`tel:${contractor.phone}`}>
              <Phone className="h-3 w-3" />
              <span className="hidden sm:inline">Call</span>
            </a>
          </EnhancedButton>
        )}
      </div>
    </div>
  );
};

export default ContractorCardFooter;
