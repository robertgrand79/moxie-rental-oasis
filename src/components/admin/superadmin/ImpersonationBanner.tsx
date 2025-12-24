import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ImpersonationBannerProps {
  organizationName: string;
  onExit: () => void;
}

const ImpersonationBanner = ({ organizationName, onExit }: ImpersonationBannerProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-600/30 rounded-full px-3 py-1">
            <Eye className="h-4 w-4" />
            <span className="font-semibold text-sm">VIEWING AS TENANT</span>
          </div>
          <span className="text-sm">
            You are viewing <strong>{organizationName}</strong> in read-only mode
          </span>
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs bg-amber-600/30 px-2 py-0.5 rounded">READ-ONLY</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExit}
          className="bg-white hover:bg-amber-100 border-amber-700 text-amber-900"
        >
          <X className="h-4 w-4 mr-1" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
