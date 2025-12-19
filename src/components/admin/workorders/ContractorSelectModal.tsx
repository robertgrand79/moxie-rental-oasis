import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Contractor } from '@/hooks/useWorkOrderManagement';
import { Search, User, Building, Mail, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractorSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contractorId: string) => void;
  contractors: Contractor[];
  selectedWorkOrderCount: number;
  isSending: boolean;
}

const ContractorSelectModal = ({
  isOpen,
  onClose,
  onSelect,
  contractors,
  selectedWorkOrderCount,
  isSending,
}: ContractorSelectModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);

  // Filter contractors with valid email addresses
  const filteredContractors = contractors.filter((contractor) => {
    if (!contractor.email || !contractor.is_active) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      contractor.name.toLowerCase().includes(query) ||
      contractor.company_name?.toLowerCase().includes(query) ||
      contractor.email.toLowerCase().includes(query)
    );
  });

  const handleConfirm = () => {
    if (selectedContractorId) {
      onSelect(selectedContractorId);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedContractorId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Contractor</DialogTitle>
          <DialogDescription>
            Choose a contractor to receive {selectedWorkOrderCount} work order{selectedWorkOrderCount > 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border">
            {filteredContractors.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No contractors with email addresses found.
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredContractors.map((contractor) => (
                  <button
                    key={contractor.id}
                    onClick={() => setSelectedContractorId(contractor.id)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors",
                      selectedContractorId === contractor.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        selectedContractorId === contractor.id
                          ? "bg-primary-foreground/20"
                          : "bg-primary/10"
                      )}>
                        <User className={cn(
                          "h-5 w-5",
                          selectedContractorId === contractor.id
                            ? "text-primary-foreground"
                            : "text-primary"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{contractor.name}</div>
                        {contractor.company_name && (
                          <div className={cn(
                            "flex items-center gap-1 text-sm",
                            selectedContractorId === contractor.id
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          )}>
                            <Building className="h-3 w-3" />
                            <span className="truncate">{contractor.company_name}</span>
                          </div>
                        )}
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          selectedContractorId === contractor.id
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        )}>
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{contractor.email}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedContractorId || isSending}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send Work Orders'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractorSelectModal;
