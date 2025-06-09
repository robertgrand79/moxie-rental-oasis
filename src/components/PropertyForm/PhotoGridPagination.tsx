
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoGridPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  disabled?: boolean;
}

const PhotoGridPagination = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  disabled = false
}: PhotoGridPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onPrevPage}
        disabled={currentPage === 0 || disabled}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      <span className="text-sm text-muted-foreground">
        Page {currentPage + 1} of {totalPages}
      </span>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={currentPage === totalPages - 1 || disabled}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default PhotoGridPagination;
