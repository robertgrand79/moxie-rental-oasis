import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreference {
  id: string;
  user_id: string;
  organization_id: string;
  notification_type: string;
  in_app: boolean;
  email_instant: boolean;
  email_digest: boolean;
  sms: boolean;
}

export const NOTIFICATION_TYPES = [
  { type: 'new_booking', label: 'New Booking', description: 'When a new reservation is created' },
  { type: 'booking_cancelled', label: 'Booking Cancelled', description: 'When a reservation is cancelled' },
  { type: 'guest_message', label: 'Guest Message', description: 'When a guest sends a message' },
  { type: 'work_order_created', label: 'Work Order Created', description: 'When a new work order is created' },
  { type: 'work_order_completed', label: 'Work Order Completed', description: 'When a work order is marked complete' },
  { type: 'check_in_today', label: 'Check-in Today', description: 'Daily reminder of check-ins' },
  { type: 'check_out_today', label: 'Check-out Today', description: 'Daily reminder of check-outs' },
  { type: 'payment_received', label: 'Payment Received', description: 'When a payment is processed' },
  { type: 'payment_failed', label: 'Payment Failed', description: 'When a payment fails' },
];

export const useNotificationPreferences = () => {
  const { organization } = useCurrentOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch preferences
  const { data: preferences = [], isLoading } = useQuery({
    queryKey: ['notification-preferences', organization?.id, user?.id],
    queryFn: async () => {
      if (!organization?.id || !user?.id) return [];

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching notification preferences:', error);
        return [];
      }

      return data as NotificationPreference[];
    },
    enabled: !!organization?.id && !!user?.id,
  });

  // Get preference for a specific notification type
  const getPreference = (notificationType: string): NotificationPreference | null => {
    return preferences.find(p => p.notification_type === notificationType) || null;
  };

  // Update or create preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ 
      notificationType, 
      field, 
      value 
    }: { 
      notificationType: string; 
      field: 'in_app' | 'email_instant' | 'email_digest' | 'sms'; 
      value: boolean 
    }) => {
      if (!organization?.id || !user?.id) throw new Error('Not authenticated');

      const existingPref = getPreference(notificationType);
      
      if (existingPref) {
        // Update existing preference
        const { error } = await supabase
          .from('notification_preferences')
          .update({ [field]: value, updated_at: new Date().toISOString() })
          .eq('id', existingPref.id);

        if (error) throw error;
      } else {
        // Create new preference with defaults
        const newPref = {
          user_id: user.id,
          organization_id: organization.id,
          notification_type: notificationType,
          in_app: field === 'in_app' ? value : true,
          email_instant: field === 'email_instant' ? value : false,
          email_digest: field === 'email_digest' ? value : true,
          sms: field === 'sms' ? value : false,
        };

        const { error } = await supabase
          .from('notification_preferences')
          .insert(newPref);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  // Initialize default preferences for all notification types
  const initializePreferencesMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id || !user?.id) throw new Error('Not authenticated');

      const existingTypes = preferences.map(p => p.notification_type);
      const missingTypes = NOTIFICATION_TYPES.filter(nt => !existingTypes.includes(nt.type));

      if (missingTypes.length === 0) return;

      const newPreferences = missingTypes.map(nt => ({
        user_id: user.id,
        organization_id: organization.id,
        notification_type: nt.type,
        in_app: true,
        email_instant: false,
        email_digest: true,
        sms: false,
      }));

      const { error } = await supabase
        .from('notification_preferences')
        .insert(newPreferences);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  return {
    preferences,
    isLoading,
    getPreference,
    updatePreference: updatePreferenceMutation.mutate,
    initializePreferences: initializePreferencesMutation.mutate,
    isUpdating: updatePreferenceMutation.isPending,
  };
};
