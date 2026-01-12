import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Sparkles, X } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { differenceInDays, parseISO, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const TrialBanner: React.FC = () => {
  const { organization, isPlatformAdmin } = useCurrentOrganization();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if dismissed
  if (dismissed) return null;

  // Only show for trial subscriptions (check both 'trial' and 'trialing' values)
  const isTrialing = ['trial', 'trialing'].includes(organization?.subscription_status ?? '');
  if (!isTrialing) return null;

  // Need trial_ends_at to calculate days
  if (!organization.trial_ends_at) return null;

  const trialEndDate = parseISO(organization.trial_ends_at);
  const daysLeft = differenceInDays(trialEndDate, new Date());
  const isExpired = isPast(trialEndDate);

  // Determine urgency styling
  const isUrgent = daysLeft <= 3;
  const bgClass = isExpired
    ? 'bg-destructive text-destructive-foreground'
    : isUrgent
    ? 'bg-amber-500 text-white'
    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';

  return (
    <div className={`${bgClass} px-4 py-2 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3 flex-1">
        <Clock className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">
          {isExpired ? (
            'Your free trial has expired.'
          ) : daysLeft === 0 ? (
            'Your free trial expires today!'
          ) : daysLeft === 1 ? (
            '1 day left in your free trial'
          ) : (
            `${daysLeft} days left in your free trial`
          )}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="bg-white text-blue-600 hover:bg-white/90"
        >
          <Link to="/admin/settings/billing" className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Subscribe Now
          </Link>
        </Button>
        
        {!isExpired && (
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TrialBanner;
