import { useState } from 'react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactData {
  email: string;
  phone: string;
  address: string;
}

interface Props {
  onComplete: (data?: ContactData) => void;
  isCompleting: boolean;
}

const OnboardingContactStep = ({ onComplete, isCompleting }: Props) => {
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const settings = [
        { key: 'contact_email', value: email },
        { key: 'contact_phone', value: phone },
        { key: 'address', value: address },
      ].filter(s => s.value);

      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            organization_id: organization.id,
            key: setting.key,
            value: setting.value,
            created_by: userId,
          }, {
            onConflict: 'organization_id,key',
          });

        if (error) throw error;
      }

      onComplete({ email, phone, address });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Contact Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@yourcompany.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Business Address (optional)</Label>
        <Input
          id="address"
          placeholder="123 Main St, City, State"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || isCompleting}>
          {saving || isCompleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </Button>
        <Button variant="ghost" onClick={() => onComplete()}>
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default OnboardingContactStep;
