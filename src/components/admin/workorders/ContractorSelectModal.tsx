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
import { Search, User, Building, Mail, Send, MessageSquare, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

  // Get selected contractor to check if they have SMS enabled
  const selectedContractor = filteredContractors.find(c => c.id === selectedContractorId);
  const willSendSms = selectedContractor?.phone && selectedContractor?.sms_opt_in !== false;

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
                {filteredContractors.map((contractor) => {
                  const hasSms = contractor.phone && contractor.sms_opt_in !== false;
                  return (
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{contractor.name}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className={cn(
                                "text-[10px] px-1.5 py-0",
                                selectedContractorId === contractor.id
                                  ? "border-primary-foreground/40 text-primary-foreground"
                                  : "border-blue-200 text-blue-600 bg-blue-50"
                              )}>
                                <Mail className="h-2.5 w-2.5 mr-0.5" />
                                Email
                              </Badge>
                              {hasSms && (
                                <Badge variant="outline" className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  selectedContractorId === contractor.id
                                    ? "border-primary-foreground/40 text-primary-foreground"
                                    : "border-green-200 text-green-600 bg-green-50"
                                )}>
                                  <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                                  SMS
                                </Badge>
                              )}
                            </div>
                          </div>
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
                            "flex items-center gap-3 text-sm",
                            selectedContractorId === contractor.id
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          )}>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{contractor.email}</span>
                            </span>
                            {contractor.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span className="truncate">{contractor.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Send method indicator */}
        {selectedContractor && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <span className="text-muted-foreground">Will send via:</span>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Badge>
              {willSendSms ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  SMS
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  No SMS (no phone)
                </Badge>
              )}
            </div>
          </div>
        )}

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
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractorSelectModal;
