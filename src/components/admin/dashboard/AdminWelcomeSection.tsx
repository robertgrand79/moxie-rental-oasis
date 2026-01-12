import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface AdminWelcomeSectionProps {
  lastUpdated?: Date;
  siteStatus?: 'healthy' | 'warning' | 'error';
  onRefresh?: () => void;
}

const AdminWelcomeSection = ({ 
  lastUpdated = new Date(), 
  siteStatus = 'healthy',
  onRefresh 
}: AdminWelcomeSectionProps) => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Welcome back, {displayName}! 👋
        </h1>
        <div className="flex items-center gap-1.5" title={`System ${siteStatus}`}>
          <div className={`h-2 w-2 rounded-full ${getStatusColor(siteStatus)}`} />
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
      
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Updated {format(lastUpdated, 'h:mm a')}</span>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 px-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminWelcomeSection;
