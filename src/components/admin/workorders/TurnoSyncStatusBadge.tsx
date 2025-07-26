import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCw, AlertTriangle, Clock, CheckCircle, WifiOff } from 'lucide-react';
import { useTurnoSync } from '@/hooks/useTurnoSync';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

interface TurnoSyncStatusBadgeProps {
  workOrder: WorkOrder;
  showActions?: boolean;
}

const TurnoSyncStatusBadge = ({ workOrder, showActions = true }: TurnoSyncStatusBadgeProps) => {
  const { syncWorkOrderToTurno, syncStatus } = useTurnoSync();

  const getSyncStatusInfo = () => {
    // Check if work order is linked to Turno
    if (!workOrder.turno_problem_id) {
      return {
        status: 'not_linked',
        label: 'Not linked',
        icon: WifiOff,
        variant: 'secondary' as const,
        tooltip: 'This work order is not linked to a Turno problem'
      };
    }

    // Check for sync conflicts
    if (workOrder.sync_conflict_reason) {
      return {
        status: 'conflict',
        label: 'Conflict',
        icon: AlertTriangle,
        variant: 'destructive' as const,
        tooltip: workOrder.sync_conflict_reason
      };
    }

    // Check if manual override is enabled
    if (workOrder.turno_status_override) {
      return {
        status: 'override',
        label: 'Override',
        icon: AlertTriangle,
        variant: 'outline' as const,
        tooltip: 'Manual sync override enabled - will not sync from Turno'
      };
    }

    // Check sync freshness
    if (workOrder.last_turno_sync_at) {
      const lastSync = new Date(workOrder.last_turno_sync_at);
      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSync < 1) {
        return {
          status: 'synced',
          label: 'Synced',
          icon: CheckCircle,
          variant: 'default' as const,
          tooltip: `Last synced: ${lastSync.toLocaleTimeString()}`
        };
      } else {
        return {
          status: 'stale',
          label: 'Needs sync',
          icon: Clock,
          variant: 'outline' as const,
          tooltip: `Last synced: ${lastSync.toLocaleString()}`
        };
      }
    }

    return {
      status: 'pending',
      label: 'Pending',
      icon: Clock,
      variant: 'outline' as const,
      tooltip: 'Never synced with Turno'
    };
  };

  const statusInfo = getSyncStatusInfo();
  const Icon = statusInfo.icon;

  const handleManualSync = async () => {
    if (workOrder.turno_problem_id) {
      await syncWorkOrderToTurno(workOrder.id);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusInfo.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showActions && workOrder.turno_problem_id && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualSync}
                disabled={syncStatus.isLoading}
                className="h-6 w-6 p-0"
              >
                <RotateCw className={`h-3 w-3 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sync to Turno</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default TurnoSyncStatusBadge;