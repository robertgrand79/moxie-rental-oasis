
import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePropertyFetch = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    console.log('Fetching properties...');
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        setError(error.message);
        toast({
          title: 'Error',
          description: 'Failed to fetch properties.',
          variant: 'destructive'
        });
        // Set empty array on error to prevent undefined
        setProperties([]);
      } else {
        console.log('Fetched properties:', data);
        // Ensure we always have an array, even if data is null
        const safeProperties = Array.isArray(data) ? data : [];
        setProperties(safeProperties);
      }
    } catch (error) {
      console.error('Error in fetchProperties:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties.',
        variant: 'destructive'
      });
      // Set empty array on error to prevent undefined
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    setProperties,
    loading,
    error,
    refetch: fetchProperties
  };
};
