import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { TurnoProperty, TurnoPropertyMapping } from '@/types/turno';

export const useTurnoProperties = () => {
  const [turnoProperties, setTurnoProperties] = useState<TurnoProperty[]>([]);
  const [mappings, setMappings] = useState<TurnoPropertyMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  const fetchTurnoProperties = async () => {
    if (!organization?.id) {
      console.error('🚫 No organization context for Turno sync');
      toast({
        title: 'Error',
        description: 'Organization context not loaded. Please refresh and try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🏠 Fetching Turno properties for organization:', organization.id, organization.name);
      setSyncing(true);
      
      const { data, error } = await supabase.functions.invoke('turno-sync-properties', {
        body: { organizationId: organization.id }
      });
      
      if (error) {
        throw error;
      }

      if (data?.success && data?.properties) {
        const properties = data.properties || [];
        console.log('📋 Turno properties received:', properties.length, properties);
        setTurnoProperties(properties);
        
        toast({
          title: 'Success',
          description: `Fetched ${properties.length} properties from Turno`,
        });
      } else {
        console.log('⚠️ No properties data in response:', data);
        setTurnoProperties([]);
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

  const fetchMappings = async () => {
    if (!organization?.id) {
      console.log('⏳ Waiting for organization context to fetch mappings...');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('turno_property_mapping')
        .select(`
          *,
          property:properties(id, title, location)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('📊 Fetched mappings for org:', organization.id, data?.length || 0);
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
    if (!organization?.id) {
      toast({
        title: 'Error',
        description: 'Organization context not loaded',
        variant: 'destructive',
      });
      throw new Error('No organization context');
    }

    try {
      console.log('🔄 Creating mapping:', { propertyId, turnoPropertyId, organizationId: organization.id });
      
      // Get Turno property details
      const turnoProperty = turnoProperties.find(p => String(p.id) === String(turnoPropertyId));
      if (!turnoProperty) {
        throw new Error('Turno property not found');
      }

      console.log('📋 Found Turno property:', turnoProperty);

      const { data, error } = await supabase
        .from('turno_property_mapping')
        .update({
          property_id: propertyId,
          is_active: true
        })
        .eq('turno_property_id', turnoPropertyId)
        .eq('organization_id', organization.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Mapping created successfully:', data);

      console.log('🔄 Refreshing mappings list...');
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
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await fetchMappings();
      setLoading(false);
    };

    loadData();
  }, [organization?.id]);

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
