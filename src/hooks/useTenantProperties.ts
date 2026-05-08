import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { Property } from '@/types/property';

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmedValue);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      // Fall through to comma-separated parsing.
    }

    return trimmedValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeAmenities = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).join(', ');
  }

  return '';
};

const normalizeNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

const normalizeProperty = (raw: Record<string, unknown>): Property => ({
  id: typeof raw.id === 'string' ? raw.id : '',
  title: typeof raw.title === 'string' ? raw.title : 'Untitled Property',
  description: typeof raw.description === 'string' ? raw.description : '',
  location: typeof raw.location === 'string' ? raw.location : '',
  city: typeof raw.city === 'string' ? raw.city : undefined,
  state: typeof raw.state === 'string' ? raw.state : undefined,
  country: typeof raw.country === 'string' ? raw.country : undefined,
  zip_code: typeof raw.zip_code === 'string' ? raw.zip_code : undefined,
  bedrooms: typeof raw.bedrooms === 'number' ? raw.bedrooms : 0,
  bathrooms: typeof raw.bathrooms === 'number' ? raw.bathrooms : 0,
  max_guests: typeof raw.max_guests === 'number' ? raw.max_guests : 0,
  price_per_night: normalizeNumber(raw.price_per_night),
  cleaning_fee: normalizeNumber(raw.cleaning_fee),
  service_fee_percentage: normalizeNumber(raw.service_fee_percentage),
  extra_guest_fee: normalizeNumber(raw.extra_guest_fee),
  extra_guest_threshold: normalizeNumber(raw.extra_guest_threshold),
  pet_fee: normalizeNumber(raw.pet_fee),
  pet_fee_type: typeof raw.pet_fee_type === 'string' ? raw.pet_fee_type : undefined,
  image_url: typeof raw.image_url === 'string' ? raw.image_url : undefined,
  cover_image_url: typeof raw.cover_image_url === 'string' ? raw.cover_image_url : undefined,
  images: normalizeStringArray(raw.images),
  featured_photos: normalizeStringArray(raw.featured_photos),
  airbnb_listing_url: typeof raw.airbnb_listing_url === 'string' ? raw.airbnb_listing_url : undefined,
  pricelabs_listing_id: typeof raw.pricelabs_listing_id === 'string' ? raw.pricelabs_listing_id : undefined,
  amenities: normalizeAmenities(raw.amenities),
  display_order: normalizeNumber(raw.display_order),
  latitude: normalizeNumber(raw.latitude),
  longitude: normalizeNumber(raw.longitude),
  organization_id: typeof raw.organization_id === 'string' ? raw.organization_id : undefined,
  calendar_export_token: typeof raw.calendar_export_token === 'string' ? raw.calendar_export_token : undefined,
  created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
  updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  created_by: typeof raw.created_by === 'string' ? raw.created_by : undefined,
});

/**
 * Hook to fetch properties for the current tenant.
 */
export const useTenantProperties = () => {
  const { tenantId, tenant, loading: tenantLoading } = useTenant();

  const query = useQuery({
    queryKey: ['tenant-properties', tenantId],
    queryFn: async (): Promise<Property[]> => {
      if (!tenantId) {
        console.log('🏠 [TenantProperties] No tenantId, returning empty array');
        return [];
      }

      console.log('🏠 [TenantProperties] Fetching properties for org:', tenantId, tenant?.name);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', tenantId)
        .order('display_order', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('🏠 [TenantProperties] Error:', error.message);
        throw error;
      }

      const normalizedProperties = (data ?? []).map((property) =>
        normalizeProperty(property as Record<string, unknown>)
      );

      console.log('🏠 [TenantProperties] Loaded', normalizedProperties.length, 'properties');
      return normalizedProperties;
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 2 * 60 * 1000,
  });

  return {
    properties: query.data ?? [],
    loading: tenantLoading || query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
};
