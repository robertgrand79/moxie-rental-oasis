import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TurnoProperty, TurnoPropertyMapping } from '@/types/turno';

export const useTurnoProperties = () => {
  const [turnoProperties, setTurnoProperties] = useState<TurnoProperty[]>([]);
  const [mappings, setMappings] = useState<TurnoPropertyMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchTurnoProperties = async () => {
    try {
      console.log('🏠 Fetching Turno properties from API...');
      setSyncing(true);
      
      const { data, error } = await supabase.functions.invoke('turno-sync');
      
      if (error) {
        throw error;
      }

      if (data?.success && data?.data?.properties) {
        const properties = data.data.properties.sample || [];
        setTurnoProperties(properties);
        
        // Cache properties in database
        await cacheTurnoProperties(properties);
        
        toast({
          title: 'Success',
          description: `Fetched ${properties.length} properties from Turno`,
        });
      }
    } catch (error) {
      console.error('Error fetching Turno properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Turno properties',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const cacheTurnoProperties = async (properties: TurnoProperty[]) => {
    try {
      // Update existing mappings with latest property data
      for (const property of properties) {
        const { error } = await supabase
          .from('turno_property_mapping')
          .upsert({
            turno_property_id: property.id,
            property_name: property.name,
            is_active: false
          }, {
            onConflict: 'turno_property_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error caching Turno property:', error);
        }
      }
    } catch (error) {
      console.error('Error caching Turno properties:', error);
    }
  };

  const fetchMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('turno_property_mapping')
        .select(`
          *,
          property:properties(id, title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error('Error fetching mappings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch property mappings',
        variant: 'destructive',
      });
    }
  };

  const createMapping = async (propertyId: string, turnoPropertyId: string) => {
    try {
      // Get Turno property details
      const turnoProperty = turnoProperties.find(p => p.id === turnoPropertyId);
      if (!turnoProperty) {
        throw new Error('Turno property not found');
      }

      const { data, error } = await supabase
        .from('turno_property_mapping')
        .update({
          property_id: propertyId,
          is_active: true
        })
        .eq('turno_property_id', turnoPropertyId)
        .select()
        .single();

      if (error) throw error;

      await fetchMappings();
      
      toast({
        title: 'Success',
        description: 'Property mapping created successfully',
      });

      return data;
    } catch (error) {
      console.error('Error creating mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to create property mapping',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase
        .from('turno_property_mapping')
        .update({
          property_id: null,
          is_active: false
        })
        .eq('id', mappingId);

      if (error) throw error;

      await fetchMappings();
      
      toast({
        title: 'Success',
        description: 'Property mapping deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property mapping',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateMappingStatus = async (mappingId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('turno_property_mapping')
        .update({ 
          is_active: isActive
        })
        .eq('id', mappingId);

      if (error) throw error;

      await fetchMappings();
      
      toast({
        title: 'Success',
        description: 'Mapping status updated successfully',
      });
    } catch (error) {
      console.error('Error updating mapping status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update mapping status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMappings(), fetchTurnoProperties()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    turnoProperties,
    mappings,
    loading,
    syncing,
    fetchTurnoProperties,
    createMapping,
    deleteMapping,
    updateMappingStatus,
    refreshMappings: fetchMappings,
  };
};