
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyProject } from './types';

export const useProjectOperations = (
  setProjects: React.Dispatch<React.SetStateAction<PropertyProject[]>>
) => {
  const { toast } = useToast();

  const createProject = async (projectData: Omit<PropertyProject, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('property_projects')
        .insert([{ ...projectData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        // Fetch the property data if property_id exists
        let property = null;
        if (data.property_id) {
          const { data: propertyData } = await supabase
            .from('properties')
            .select('*')
            .eq('id', data.property_id)
            .single();
          property = propertyData;
        }
        
        const projectWithProperty: PropertyProject = {
          id: data.id,
          property_id: data.property_id,
          title: data.title,
          description: data.description,
          type: data.type as PropertyProject['type'],
          status: data.status as PropertyProject['status'],
          priority: data.priority as PropertyProject['priority'],
          start_date: data.start_date,
          target_completion_date: data.target_completion_date,
          actual_completion_date: data.actual_completion_date,
          budget: data.budget,
          actual_cost: data.actual_cost,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
          property
        };
        
        setProjects(prev => [projectWithProperty, ...prev]);
        
        toast({
          title: 'Success',
          description: 'Project created successfully',
        });
        
        return projectWithProperty;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    createProject,
  };
};
