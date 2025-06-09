
import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePropertyFetch = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    console.log('Fetching properties...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch properties.',
          variant: 'destructive'
        });
        setProperties([]);
      } else {
        console.log('Fetched properties:', data);
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error in fetchProperties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties.',
        variant: 'destructive'
      });
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
    refetch: fetchProperties
  };
};
