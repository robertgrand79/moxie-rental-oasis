
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ContractorContactInfoProps {
  email: string;
  phone?: string;
  address?: string;
}

const ContractorContactInfo = ({
  email,
  phone,
  address,
}: ContractorContactInfoProps) => {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <Mail className="h-4 w-4 flex-shrink-0" />
        <a 
          href={`mailto:${email}`}
          className="truncate hover:text-blue-600 transition-colors"
        >
          {email}
        </a>
      </div>
      
      {phone && (
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <a 
            href={`tel:${phone}`}
            className="hover:text-blue-600 transition-colors"
          >
            {phone}
          </a>
        </div>
      )}
      
      {address && (
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{address}</span>
        </div>
      )}
    </div>
  );
};

export default ContractorContactInfo;
