import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TurnoProblem } from '@/types/turnoProblems';
import { 
  Package, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';

interface TurnoBulkActionsProps {
  selectedProblems: string[];
  problems: TurnoProblem[];
  onClearSelection: () => void;
  onBulkDelete?: (problemIds: string[]) => Promise<void>;
  onBulkCreateWorkOrders?: (problemIds: string[]) => Promise<void>;
  onBulkStatusUpdate?: (problemIds: string[], status: string) => Promise<void>;
  onBulkExport?: (problemIds: string[]) => void;
}

const TurnoBulkActions = ({
  selectedProblems,
  problems,
  onClearSelection,
  onBulkDelete,
  onBulkCreateWorkOrders,
  onBulkStatusUpdate,
  onBulkExport
}: TurnoBulkActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [isCreateWorkOrdersDialogOpen, setIsCreateWorkOrdersDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [createWorkOrderOptions, setCreateWorkOrderOptions] = useState({
    skipLinked: true,
    autoAssignContractor: true,
    setPriorityFromProblem: true
  });
  const [loading, setLoading] = useState(false);

  const selectedProblemData = problems.filter(p => selectedProblems.includes(p.id));
  
  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;
    
    setLoading(true);
    try {
      await onBulkDelete(selectedProblems);
      toast.success(`Deleted ${selectedProblems.length} problems`);
      setIsDeleteDialogOpen(false);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to delete problems');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!onBulkStatusUpdate || !newStatus) return;
    
    setLoading(true);
    try {
      await onBulkStatusUpdate(selectedProblems, newStatus);
      toast.success(`Updated status for ${selectedProblems.length} problems`);
      setIsStatusUpdateDialogOpen(false);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to update problem status');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateWorkOrders = async () => {
    if (!onBulkCreateWorkOrders) return;
    
    setLoading(true);
    try {
      let problemsToProcess = selectedProblems;
      
      // Filter out already linked problems if option is selected
      if (createWorkOrderOptions.skipLinked) {
        problemsToProcess = selectedProblems.filter(id => {
          const problem = problems.find(p => p.id === id);
          return !problem?.linked_work_order_id;
        });
      }
      
      if (problemsToProcess.length === 0) {
        toast.error('No eligible problems found for work order creation');
        return;
      }
      
      await onBulkCreateWorkOrders(problemsToProcess);
      toast.success(`Created work orders for ${problemsToProcess.length} problems`);
      setIsCreateWorkOrdersDialogOpen(false);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to create work orders');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!onBulkExport) return;
    onBulkExport(selectedProblems);
    toast.success('Export started');
  };

  const getStatusStats = () => {
    const stats = selectedProblemData.reduce((acc, problem) => {
      acc[problem.status] = (acc[problem.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const getLinkedStats = () => {
    const linked = selectedProblemData.filter(p => p.linked_work_order_id).length;
    const unlinked = selectedProblems.length - linked;
    return { linked, unlinked };
  };

  const statusStats = getStatusStats();
  const linkedStats = getLinkedStats();

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="font-medium">{selectedProblems.length} selected</span>
        </div>
        
        <div className="flex gap-2">
          {Object.entries(statusStats).map(([status, count]) => (
            <Badge key={status} variant="outline" className="text-xs">
              {status}: {count}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            Linked: {linkedStats.linked}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Unlinked: {linkedStats.unlinked}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Create Work Orders */}
        {onBulkCreateWorkOrders && (
          <Dialog open={isCreateWorkOrdersDialogOpen} onOpenChange={setIsCreateWorkOrdersDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Link2 className="h-4 w-4 mr-1" />
                Create Work Orders
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Work Orders</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create work orders for {selectedProblems.length} selected problems.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="skipLinked"
                      checked={createWorkOrderOptions.skipLinked}
                      onCheckedChange={(checked) => 
                        setCreateWorkOrderOptions(prev => ({ ...prev, skipLinked: !!checked }))
                      }
                    />
                    <label htmlFor="skipLinked" className="text-sm">
                      Skip problems already linked to work orders ({linkedStats.linked} problems)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoAssign"
                      checked={createWorkOrderOptions.autoAssignContractor}
                      onCheckedChange={(checked) => 
                        setCreateWorkOrderOptions(prev => ({ ...prev, autoAssignContractor: !!checked }))
                      }
                    />
                    <label htmlFor="autoAssign" className="text-sm">
                      Auto-assign contractors based on problem type
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="setPriority"
                      checked={createWorkOrderOptions.setPriorityFromProblem}
                      onCheckedChange={(checked) => 
                        setCreateWorkOrderOptions(prev => ({ ...prev, setPriorityFromProblem: !!checked }))
                      }
                    />
                    <label htmlFor="setPriority" className="text-sm">
                      Set work order priority based on problem urgency
                    </label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateWorkOrdersDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkCreateWorkOrders} disabled={loading}>
                    {loading ? 'Creating...' : `Create ${createWorkOrderOptions.skipLinked ? linkedStats.unlinked : selectedProblems.length} Work Orders`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Status Update */}
        {onBulkStatusUpdate && (
          <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Update status for {selectedProblems.length} selected problems.
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsStatusUpdateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkStatusUpdate} disabled={!newStatus || loading}>
                    {loading ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Export */}
        {onBulkExport && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        )}

        {/* Delete */}
        {onBulkDelete && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete Problems
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete {selectedProblems.length} selected problems? 
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleBulkDelete} disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete Problems'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>
    </div>
  );
};

export default TurnoBulkActions;