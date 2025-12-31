import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tv, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * PairTV - Mobile page for guests to pair with TV
 * 
 * Flow:
 * 1. Guest scans QR code on TV
 * 2. Enters their email (validated against reservation)
 * 3. TV automatically navigates to portal
 */
const PairTV: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const codeFromUrl = searchParams.get('code') || '';
  const propertyFromUrl = searchParams.get('property') || '';
  
  const [pairingCode, setPairingCode] = useState(codeFromUrl);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaired, setIsPaired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCode || !email) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call edge function to validate and pair
      const { data, error: fnError } = await supabase.functions.invoke('tv-pairing-validate', {
        body: { pairing_code: pairingCode, email }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to connect to pairing service');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Invalid or expired pairing code');
      }

      setIsPaired(true);
      toast({
        title: 'Successfully paired!',
        description: data.message || 'The TV will now show your guest portal.'
      });

    } catch (err: any) {
      console.error('Pairing error:', err);
      setError(err.message || 'Failed to pair with TV');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPaired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Successfully Paired!</h2>
              <p className="text-muted-foreground">
                Your TV is now connected. The guest portal should appear on the TV screen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Tv className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Connect to TV</CardTitle>
          <CardDescription>
            Enter the code shown on the TV and your email to access the guest portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePair} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Pairing Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus={!codeFromUrl}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={!!codeFromUrl}
              />
              <p className="text-xs text-muted-foreground">
                Use the email from your reservation
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={pairingCode.length !== 6 || !email || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                'Connect to TV'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PairTV;
