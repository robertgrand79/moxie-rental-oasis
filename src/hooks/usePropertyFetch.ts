
import { useState, useEffect, useCallback } from 'react';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export const usePropertyFetch = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { organization, loading: orgLoading } = useCurrentOrganization();

  const fetchProperties = useCallback(async () => {
    // Wait for organization to be available
    if (!organization?.id) {
      console.log('🔄 usePropertyFetch - Waiting for organization...');
      setProperties([]);
      setLoading(false);
      return;
    }

    console.log('🔄 usePropertyFetch - Starting to fetch properties for org:', organization.id);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 usePropertyFetch - Calling Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', organization.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ usePropertyFetch - Supabase error:', error);
        console.error('❌ usePropertyFetch - Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setError(error.message);
        toast({
          title: 'Error',
          description: `Failed to fetch properties: ${error.message}`,
          variant: 'destructive'
        });
        setProperties([]);
      } else {
        console.log('✅ usePropertyFetch - Success! Fetched properties:', data?.length || 0, 'items');
        console.log('✅ usePropertyFetch - First property sample:', data?.[0]);
        const safeProperties = Array.isArray(data) ? data : [];
        setProperties(safeProperties);
      }
    } catch (error) {
      console.error('❌ usePropertyFetch - Catch block error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to fetch properties: ${errorMessage}`,
        variant: 'destructive'
      });
      setProperties([]);
    } finally {
      console.log('🏁 usePropertyFetch - Finished (loading set to false)');
      setLoading(false);
    }
  }, [organization?.id]);

  useEffect(() => {
    if (!orgLoading) {
      fetchProperties();
    }
  }, [orgLoading, fetchProperties]);

  return {
    properties,
    setProperties,
    loading: loading || orgLoading,
    error,
    refetch: fetchProperties
  };
};
