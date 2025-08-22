
import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { 
  Grid3X3, 
  Table,
  Download,
  RefreshCw,
  SortAsc
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContractorViewControlsProps {
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onRefresh: () => void;
}

const ContractorViewControls = ({
  viewMode,
  onViewModeChange,
  onRefresh,
}: ContractorViewControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-muted/10 rounded-lg p-1">
        <EnhancedButton
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="min-h-[44px] sm:min-h-auto"
        >
          <Grid3X3 className="h-4 w-4" />
        </EnhancedButton>
        <EnhancedButton
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('table')}
          className="min-h-[44px] sm:min-h-auto"
        >
          <Table className="h-4 w-4" />
        </EnhancedButton>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EnhancedButton 
            variant="outline" 
            size="sm"
            className="min-h-[44px] sm:min-h-auto"
          >
            <SortAsc className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Actions</span>
          </EnhancedButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ContractorViewControls;
