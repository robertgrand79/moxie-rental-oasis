import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DigitalGuidebook from '@/components/guest/DigitalGuidebook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { BookOpen, MapPin, Compass, ArrowLeft } from 'lucide-react';

interface BookedProperty {
  id: string;
  title: string;
  address: string;
}

const MobileGuidebook: React.FC = () => {
  const { propertyId: urlPropertyId } = useParams<{ propertyId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(urlPropertyId);

  // Fetch guest profile
  const { data: profile } = useQuery({
    queryKey: ['mobile-guidebook-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('guest_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch all unique booked properties for this guest
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['mobile-guidebook-properties', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      const { data, error } = await supabase
        .from('property_reservations')
        .select('property_id, properties:property_id(id, title, address)')
        .eq('guest_email', profile.email)
        .eq('booking_status', 'confirmed');

      if (error) throw error;

      // Extract unique properties
      const seenIds = new Set<string>();
      const list: BookedProperty[] = [];

      data.forEach((r: any) => {
        if (r.properties && !seenIds.has(r.properties.id)) {
          seenIds.add(r.properties.id);
          list.push({
            id: r.properties.id,
            title: r.properties.title,
            address: r.properties.address || ''
          });
        }
      });

      return list;
    },
    enabled: !!profile?.email,
  });

  // Automatically select the first property if none is selected
  React.useEffect(() => {
    if (urlPropertyId) {
      setSelectedPropertyId(urlPropertyId);
    } else if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [urlPropertyId, properties, selectedPropertyId]);

  const activePropertyId = urlPropertyId || selectedPropertyId;

  const handlePropertyChange = (val: string) => {
    setSelectedPropertyId(val);
    navigate(`/mobile/guidebook/${val}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-zinc-950">
      {/* Property Selector Bar */}
      {properties.length > 1 && (
        <div className="bg-white dark:bg-zinc-900 border-b p-3 flex items-center justify-between gap-3 safe-area-left safe-area-right">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex-shrink-0">
            Guidebook:
          </span>
          <Select value={activePropertyId} onValueChange={handlePropertyChange}>
            <SelectTrigger className="h-9 rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-semibold">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Render digital manual */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col justify-center items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading guidebook manual...</p>
          </div>
        ) : activePropertyId ? (
          <div className="p-1">
            <DigitalGuidebook propertyId={activePropertyId} />
          </div>
        ) : (
          <div className="p-8 max-w-sm mx-auto text-center space-y-4 pt-16">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200">No manual available</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Guidebook manuals and house rules are unlocked automatically once you complete a confirmed reservation.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/mobile')}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Return Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileGuidebook;
