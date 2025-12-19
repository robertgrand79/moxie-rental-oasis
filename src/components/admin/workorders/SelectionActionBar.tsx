import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';

interface SelectionActionBarProps {
  selectedCount: number;
  onSendToContractor: () => void;
  onClearSelection: () => void;
  isSending: boolean;
}

const SelectionActionBar = ({
  selectedCount,
  onSendToContractor,
  onClearSelection,
  isSending,
}: SelectionActionBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl border border-primary/20">
        <span className="font-semibold">
          {selectedCount} work order{selectedCount > 1 ? 's' : ''} selected
        </span>
        
        <div className="h-6 w-px bg-primary-foreground/30" />
        
        <Button
          variant="secondary"
          size="sm"
          onClick={onSendToContractor}
          disabled={isSending}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSending ? 'Sending...' : 'Send to Contractor'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SelectionActionBar;
