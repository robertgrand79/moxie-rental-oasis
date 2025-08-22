
import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePropertyFetch = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    console.log('🔄 usePropertyFetch - Starting to fetch properties...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 usePropertyFetch - Calling Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
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
        // Set empty array on error to prevent undefined
        setProperties([]);
      } else {
        console.log('✅ usePropertyFetch - Success! Fetched properties:', data?.length || 0, 'items');
        console.log('✅ usePropertyFetch - First property sample:', data?.[0]);
        // Ensure we always have an array, even if data is null
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
      // Set empty array on error to prevent undefined
      setProperties([]);
    } finally {
      console.log('🏁 usePropertyFetch - Finished (loading set to false)');
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
