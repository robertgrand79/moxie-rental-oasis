import { useState } from 'react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onComplete: (data?: Record<string, any>) => void;
  isCompleting: boolean;
}

const OnboardingPropertyStep = ({ onComplete, isCompleting }: Props) => {
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [maxGuests, setMaxGuests] = useState('2');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!organization || !title || !location) return;
    setSaving(true);

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { data, error } = await supabase
        .from('properties')
        .insert({
          title,
          location,
          description: description || 'Beautiful vacation rental',
          bedrooms: parseInt(bedrooms) || 1,
          bathrooms: parseInt(bathrooms) || 1,
          max_guests: parseInt(maxGuests) || 2,
          organization_id: organization.id,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Property added!', description: 'You can add more details later' });
      onComplete({ propertyId: data.id, title });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add your first property. You can add more properties and edit details later.
      </p>

      <div className="space-y-2">
        <Label htmlFor="title">Property Name *</Label>
        <Input
          id="title"
          placeholder="Beachfront Paradise"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          placeholder="123 Beach Rd, Miami, FL"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your property..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            step="0.5"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxGuests">Max Guests</Label>
          <Input
            id="maxGuests"
            type="number"
            min="1"
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || isCompleting || !title || !location}>
          {saving || isCompleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Property & Continue'
          )}
        </Button>
        <Button variant="ghost" onClick={() => onComplete()}>
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPropertyStep;
