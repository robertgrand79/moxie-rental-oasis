export interface Reservation {
  id: string;
  property_id: string;
  external_booking_id?: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_amount?: number;
  currency?: string;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'active' | 'completed';
  source_platform?: string;
  platform_data?: Record<string, any>;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  special_requests?: string;
  confirmation_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DynamicPricing {
  id: string;
  property_id: string;
  date: string;
  base_price: number;
  pricelabs_price?: number;
  manual_override_price?: number;
  final_price: number;
  pricing_source: 'base' | 'pricelabs' | 'manual';
  market_demand?: string;
  occupancy_rate?: number;
  special_events?: string[];
  created_at: string;
  updated_at: string;
}

export interface AvailabilityBlock {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  block_type: 'booked' | 'blocked' | 'maintenance' | 'owner_use';
  external_booking_id?: string;
  source_platform?: string;
  guest_count?: number;
  notes?: string;
  sync_status?: 'pending' | 'synced' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ExternalCalendar {
  id: string;
  property_id: string;
  platform: 'vrbo' | 'airbnb' | 'booking_com';
  external_property_id: string;
  calendar_url?: string;
  sync_enabled: boolean;
  sync_status?: 'pending' | 'syncing' | 'synced' | 'failed';
  last_sync_at?: string;
  sync_errors?: string[];
  api_credentials?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  platform: string;
  sync_type: string;
  status: 'started' | 'completed' | 'failed';
  error_message?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface PricingRule {
  id: string;
  property_id: string;
  rule_name: string;
  rule_type: 'seasonal' | 'event_based' | 'occupancy' | 'last_minute' | 'early_bird';
  conditions: Record<string, any>;
  price_adjustment_type: 'percentage' | 'fixed_amount';
  price_adjustment_value: number;
  priority: number;
  is_active: boolean;
  valid_from?: string;
  valid_to?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingCalendarProps {
  propertyId?: string;
  onDateSelect?: (dates: { start: string; end: string }) => void;
  selectedDates?: { start: string; end: string };
  unavailableDates?: string[];
}

export interface PricingCalendarProps {
  propertyId: string;
  onPriceUpdate?: (date: string, price: number) => void;
  readOnly?: boolean;
}

export interface ReservationListProps {
  propertyId?: string;
  status?: Reservation['booking_status'];
  limit?: number;
  onReservationClick?: (reservation: Reservation) => void;
}
