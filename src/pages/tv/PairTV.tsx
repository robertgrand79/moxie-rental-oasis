import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tv, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTVPairing } from '@/hooks/useTVPairing';
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
  const codeFromUrl = searchParams.get('code') || '';
  
  const [pairingCode, setPairingCode] = useState(codeFromUrl);
  const [email, setEmail] = useState('');

  const {
    isPaired,
    pairingResult,
    pairDevice,
    isLoading,
    error,
    isValidCodeFormat,
    isValidEmailFormat,
  } = useTVPairing();

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCodeFormat(pairingCode) || !isValidEmailFormat(email)) return;

    pairDevice.mutate(
      { pairing_code: pairingCode, email },
      {
        onSuccess: (data) => {
          toast({
            title: 'Successfully paired!',
            description: data.message || 'The TV will now show your guest portal.',
          });
        },
      }
    );
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
              {pairingResult?.property_name && (
                <p className="text-sm text-muted-foreground mt-2">
                  Property: {pairingResult.property_name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canSubmit = isValidCodeFormat(pairingCode) && isValidEmailFormat(email) && !isLoading;

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

            <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
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
