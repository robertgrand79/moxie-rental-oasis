import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TurnoProblem } from '@/types/turnoProblems';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Building, 
  AlertTriangle,
  ExternalLink,
  Link2
} from 'lucide-react';

interface TurnoProblemDetailsProps {
  problem: TurnoProblem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkOrder?: (problemId: string) => void;
  onLinkWorkOrder?: (problemId: string) => void;
  onUnlinkWorkOrder?: (problemId: string) => void;
}

const TurnoProblemDetails = ({
  problem,
  open,
  onOpenChange,
  onCreateWorkOrder,
  onLinkWorkOrder,
  onUnlinkWorkOrder
}: TurnoProblemDetailsProps) => {
  if (!problem) return null;

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            {problem.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={getStatusVariant(problem.status)}>
                  {problem.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <Badge variant={getPriorityVariant(problem.priority)}>
                  {problem.priority.toUpperCase()}
                </Badge>
              </div>
              {problem.category && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <Badge variant="outline">{problem.category}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {problem.description && (
            <div className="space-y-2">
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {problem.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Property Information */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {problem.turno_property_data && (
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Property</label>
                  <p>{problem.turno_property_data.name}</p>
                </div>
              )}
              {problem.property_address && (
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Address</label>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {problem.property_address}
                  </p>
                </div>
              )}
              {problem.room_location && (
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Room/Location</label>
                  <p>{problem.room_location}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Reporter Information */}
          {(problem.reporter_name || problem.reporter_email || problem.reporter_phone) && (
            <>
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Reporter Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {problem.reporter_name && (
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">Name</label>
                      <p>{problem.reporter_name}</p>
                    </div>
                  )}
                  {problem.reporter_email && (
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">Email</label>
                      <p className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {problem.reporter_email}
                      </p>
                    </div>
                  )}
                  {problem.reporter_phone && (
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">Phone</label>
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {problem.reporter_phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Work Order Integration */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Work Order Integration
            </h3>
            {problem.linked_work_order ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div>
                  <p className="font-medium text-green-800">
                    Linked to Work Order #{problem.linked_work_order.work_order_number}
                  </p>
                  <p className="text-sm text-green-600">
                    Status: {problem.linked_work_order.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Work Order
                  </Button>
                  {onUnlinkWorkOrder && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onUnlinkWorkOrder(problem.id)}
                    >
                      Unlink
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div>
                  <p className="font-medium text-yellow-800">No work order linked</p>
                  <p className="text-sm text-yellow-600">
                    Create or link a work order to track resolution
                  </p>
                </div>
                <div className="flex gap-2">
                  {onCreateWorkOrder && (
                    <Button 
                      size="sm"
                      onClick={() => onCreateWorkOrder(problem.id)}
                    >
                      Create Work Order
                    </Button>
                  )}
                  {onLinkWorkOrder && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onLinkWorkOrder(problem.id)}
                    >
                      Link Existing
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {problem.turno_created_at && (
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Reported in Turno</label>
                  <p>{format(new Date(problem.turno_created_at), 'PPP p')}</p>
                </div>
              )}
              {problem.turno_updated_at && (
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Last Updated in Turno</label>
                  <p>{format(new Date(problem.turno_updated_at), 'PPP p')}</p>
                </div>
              )}
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Last Synced</label>
                <p>{format(new Date(problem.last_sync_at), 'PPP p')}</p>
              </div>
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Sync Status</label>
                <Badge variant={problem.sync_status === 'synced' ? 'default' : 'destructive'}>
                  {problem.sync_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-2 text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <h4 className="font-medium">System Information</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>Turno Problem ID: {problem.turno_problem_id}</div>
              <div>Turno Property ID: {problem.turno_property_id}</div>
              <div>Internal ID: {problem.id}</div>
              <div>Created: {format(new Date(problem.created_at), 'PPP')}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TurnoProblemDetails;