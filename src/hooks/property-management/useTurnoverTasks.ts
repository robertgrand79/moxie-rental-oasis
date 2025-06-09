
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyTask } from './types';

export const useTurnoverTasks = (
  setTasks: React.Dispatch<React.SetStateAction<PropertyTask[]>>
) => {
  const { toast } = useToast();

  const generateTurnoverTasks = async (propertyId: string, checkoutDate: string) => {
    const turnoverTasks = [
      {
        title: 'Deep Clean - Bathrooms',
        description: 'Clean and sanitize all bathrooms, replace towels and toiletries',
        type: 'cleaning' as const,
        priority: 'high' as const,
        estimated_hours: 1.5,
      },
      {
        title: 'Deep Clean - Kitchen',
        description: 'Clean appliances, sanitize surfaces, restock supplies',
        type: 'cleaning' as const,
        priority: 'high' as const,
        estimated_hours: 2,
      },
      {
        title: 'Linen Change',
        description: 'Replace all bed linens and check bed condition',
        type: 'cleaning' as const,
        priority: 'high' as const,
        estimated_hours: 0.5,
      },
      {
        title: 'Property Inspection',
        description: 'Check for damages, missing items, and maintenance needs',
        type: 'inspection' as const,
        priority: 'medium' as const,
        estimated_hours: 0.5,
      },
      {
        title: 'Amenity Restock',
        description: 'Restock coffee, toiletries, and welcome amenities',
        type: 'supply_order' as const,
        priority: 'medium' as const,
        estimated_hours: 0.25,
      },
    ];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const tasksToCreate = turnoverTasks.map(task => ({
        ...task,
        property_id: propertyId,
        status: 'pending' as const,
        due_date: checkoutDate,
        is_recurring: false,
        created_by: user.id,
      }));

      const { data, error } = await supabase
        .from('property_tasks' as any)
        .insert(tasksToCreate)
        .select();

      if (error) throw error;
      
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      const tasksWithProperty = (data || []).map((task: any) => ({
        ...task,
        property
      }));
      
      setTasks(prev => [...tasksWithProperty, ...prev]);
      toast({
        title: 'Success',
        description: `Generated ${turnoverTasks.length} turnover tasks`,
      });
      
      return tasksWithProperty;
    } catch (error) {
      console.error('Error generating turnover tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate turnover tasks',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    generateTurnoverTasks,
  };
};
