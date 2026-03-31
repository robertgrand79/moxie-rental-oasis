import { useState } from 'react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  onComplete: (data?: Record<string, any>) => void;
  isCompleting: boolean;
}

const OnboardingPaymentsStep = ({ onComplete, isCompleting }: Props) => {
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  const { setApiKey } = useSecureApiKeys();
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);

    try {
      let success = true;
      if (stripeSecretKey) success = await setApiKey(organization.id, 'stripe_secret_key', stripeSecretKey) && success;
      if (stripePublishableKey) success = await setApiKey(organization.id, 'stripe_publishable_key', stripePublishableKey) && success;

      if (success) {
        toast({ title: 'Payment settings saved!' });
        onComplete({ stripeConfigured: !!stripeSecretKey });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          Connect your Stripe account to accept online payments for bookings.
          You can skip this step and set it up later.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
        <Input
          id="stripePublishableKey"
          type="password"
          placeholder="pk_live_..."
          value={stripePublishableKey}
          onChange={(e) => setStripePublishableKey(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
        <Input
          id="stripeSecretKey"
          type="password"
          placeholder="sk_live_..."
          value={stripeSecretKey}
          onChange={(e) => setStripeSecretKey(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Find your API keys in your{' '}
          <a 
            href="https://dashboard.stripe.com/apikeys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Stripe Dashboard
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || isCompleting}>
          {saving || isCompleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : stripeSecretKey ? (
            'Save & Finish'
          ) : (
            'Skip & Finish'
          )}
        </Button>
        {stripeSecretKey && (
          <Button variant="ghost" onClick={() => onComplete()}>
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPaymentsStep;
