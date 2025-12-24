import { supabase } from '@/integrations/supabase/client';

export type GuestNotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'check_in_reminder'
  | 'check_out_reminder'
  | 'host_message'
  | 'review_request';

interface CreateGuestNotificationParams {
  guestProfileId: string;
  reservationId?: string;
  notificationType: GuestNotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  scheduledFor?: Date;
}

export async function createGuestNotification(params: CreateGuestNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('guest_notifications')
      .insert({
        guest_profile_id: params.guestProfileId,
        reservation_id: params.reservationId || null,
        notification_type: params.notificationType,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl || null,
        scheduled_for: params.scheduledFor?.toISOString() || null,
        sent_at: params.scheduledFor ? null : new Date().toISOString(),
      });

    if (error) {
      console.error('[GuestNotification] Error creating notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GuestNotification] Exception:', message);
    return { success: false, error: message };
  }
}

export async function getOrCreateGuestProfile(email: string, firstName?: string, lastName?: string): Promise<string | null> {
  try {
    // Check if guest profile exists
    const { data: existing } = await supabase
      .from('guest_profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new guest profile
    const { data: newProfile, error } = await supabase
      .from('guest_profiles')
      .insert({
        email: email.toLowerCase(),
        first_name: firstName || null,
        last_name: lastName || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[GuestNotification] Error creating guest profile:', error);
      return null;
    }

    return newProfile?.id || null;
  } catch (err) {
    console.error('[GuestNotification] Exception in getOrCreateGuestProfile:', err);
    return null;
  }
}

export async function notifyBookingConfirmed(params: {
  guestEmail: string;
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  reservationId: string;
}): Promise<void> {
  const nameParts = params.guestName.split(' ');
  const guestProfileId = await getOrCreateGuestProfile(
    params.guestEmail,
    nameParts[0],
    nameParts.slice(1).join(' ')
  );

  if (!guestProfileId) return;

  await createGuestNotification({
    guestProfileId,
    reservationId: params.reservationId,
    notificationType: 'booking_confirmed',
    title: 'Booking Confirmed!',
    message: `Your reservation at ${params.propertyName} from ${params.checkIn} to ${params.checkOut} is confirmed.`,
    actionUrl: `/guest/reservations/${params.reservationId}`,
  });
}

export async function notifyPaymentSuccess(params: {
  guestEmail: string;
  amount: number;
  propertyName: string;
  reservationId: string;
}): Promise<void> {
  const { data: profile } = await supabase
    .from('guest_profiles')
    .select('id')
    .eq('email', params.guestEmail.toLowerCase())
    .single();

  if (!profile) return;

  await createGuestNotification({
    guestProfileId: profile.id,
    reservationId: params.reservationId,
    notificationType: 'payment_success',
    title: 'Payment Received',
    message: `We've received your payment of $${params.amount.toFixed(2)} for ${params.propertyName}.`,
    actionUrl: `/guest/reservations/${params.reservationId}`,
  });
}

export async function notifyHostMessage(params: {
  guestEmail: string;
  reservationId: string;
  messagePreview: string;
}): Promise<void> {
  const { data: profile } = await supabase
    .from('guest_profiles')
    .select('id')
    .eq('email', params.guestEmail.toLowerCase())
    .single();

  if (!profile) return;

  await createGuestNotification({
    guestProfileId: profile.id,
    reservationId: params.reservationId,
    notificationType: 'host_message',
    title: 'New Message from Host',
    message: params.messagePreview.substring(0, 100) + (params.messagePreview.length > 100 ? '...' : ''),
    actionUrl: `/guest/reservations/${params.reservationId}`,
  });
}
