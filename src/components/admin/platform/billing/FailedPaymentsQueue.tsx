import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Mail,
  ExternalLink,
  Building2
} from 'lucide-react';
import { usePlatformBilling } from '@/hooks/usePlatformBilling';
import { formatDistanceToNow } from 'date-fns';

const FailedPaymentsQueue = () => {
  const { 
    failedPayments, 
    loadingFailedPayments, 
    resolvePayment, 
    retryPayment,
    isResolving,
    isRetrying,
  } = usePlatformBilling();

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveAction, setResolveAction] = useState<'resolved' | 'written_off'>('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolve = () => {
    if (selectedPayment) {
      resolvePayment({ 
        paymentId: selectedPayment, 
        status: resolveAction,
        notes: resolutionNotes 
      });
      setResolveDialogOpen(false);
      setSelectedPayment(null);
      setResolutionNotes('');
    }
  };

  const openResolveDialog = (paymentId: string, action: 'resolved' | 'written_off') => {
    setSelectedPayment(paymentId);
    setResolveAction(action);
    setResolveDialogOpen(true);
  };

  const formatCurrency = (cents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(Math.floor(cents / 100));
  };

  if (loadingFailedPayments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Failed Payments Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!failedPayments?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">All Clear!</h3>
          <p className="text-muted-foreground">No failed payments requiring attention</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Failed Payments Queue
          </CardTitle>
          <CardDescription>
            {failedPayments.length} payment{failedPayments.length !== 1 ? 's' : ''} requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {failedPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-start justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {payment.organization?.name || 'Unknown Organization'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {payment.organization?.subscription_tier || 'N/A'}
                  </Badge>
                  <Badge 
                    variant={payment.status === 'pending' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {payment.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {formatCurrency(payment.amount_cents, payment.currency)}
                  </span>
                  <span>•</span>
                  <span>Attempt #{payment.attempt_count}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(payment.last_attempt_at), { addSuffix: true })}</span>
                </div>

                {payment.failure_reason && (
                  <p className="text-sm text-destructive">
                    {payment.failure_reason}
                    {payment.failure_code && (
                      <span className="text-muted-foreground ml-2">({payment.failure_code})</span>
                    )}
                  </p>
                )}

                {payment.email_alert_sent_at && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Alert sent {formatDistanceToNow(new Date(payment.email_alert_sent_at), { addSuffix: true })}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retryPayment(payment.id)}
                  disabled={isRetrying}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openResolveDialog(payment.id, 'resolved')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openResolveDialog(payment.id, 'written_off')}
                  className="text-muted-foreground"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Write Off
                </Button>
                {payment.stripe_invoice_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a
                      href={`https://dashboard.stripe.com/invoices/${payment.stripe_invoice_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolveAction === 'resolved' ? 'Mark as Resolved' : 'Write Off Payment'}
            </DialogTitle>
            <DialogDescription>
              {resolveAction === 'resolved' 
                ? 'Confirm that this payment issue has been resolved (e.g., payment received manually, card updated).'
                : 'Mark this payment as written off and no longer attempt collection.'}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Add notes about the resolution..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={3}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResolve}
              disabled={isResolving}
              variant={resolveAction === 'written_off' ? 'destructive' : 'default'}
            >
              {resolveAction === 'resolved' ? 'Mark Resolved' : 'Write Off'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FailedPaymentsQueue;
