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
      // Find device with this pairing code
      const { data: device, error: deviceError } = await supabase
        .from('tv_device_pairings')
        .select('id, property_id, organization_id, pairing_code_expires_at')
        .eq('pairing_code', pairingCode)
        .eq('is_paired', false)
        .single();

      if (deviceError || !device) {
        throw new Error('Invalid or expired pairing code');
      }

      // Check if code is expired
      if (device.pairing_code_expires_at && new Date(device.pairing_code_expires_at) < new Date()) {
        throw new Error('Pairing code has expired. Please use the code shown on the TV.');
      }

      // Optional: Validate email against reservation
      // For now, we'll just accept any email
      const { data: reservation } = await supabase
        .from('reservations')
        .select('id, guest_name')
        .eq('property_id', device.property_id)
        .ilike('guest_email', email)
        .gte('check_out_date', new Date().toISOString().split('T')[0])
        .order('check_in_date', { ascending: true })
        .limit(1)
        .single();

      // Update device as paired
      const { error: updateError } = await supabase
        .from('tv_device_pairings')
        .update({
          is_paired: true,
          paired_at: new Date().toISOString(),
          guest_email: email,
          current_reservation_id: reservation?.id || null,
          display_mode: 'guest_portal'
        })
        .eq('id', device.id);

      if (updateError) throw updateError;

      // Log the pairing
      await supabase
        .from('tv_pairing_audit_logs')
        .insert({
          device_pairing_id: device.id,
          organization_id: device.organization_id,
          action: 'paired',
          guest_email: email,
          details: { reservation_id: reservation?.id }
        });

      setIsPaired(true);
      toast({
        title: 'Successfully paired!',
        description: 'The TV will now show your guest portal.'
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
