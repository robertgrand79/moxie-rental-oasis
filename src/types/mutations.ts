/**
 * Types for data mutation operations
 * These types ensure type safety when creating/updating database records
 */

import type { Database } from '@/integrations/supabase/types';

// === Work Order Types ===

export type WorkOrderStatus = 
  | 'draft' 
  | 'sent' 
  | 'acknowledged' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type WorkOrderPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'urgent';

export type WorkOrderBillingType = 
  | 'hourly' 
  | 'fixed' 
  | 'per_unit';

export type WorkOrderPaymentStatus = 
  | 'pending' 
  | 'invoiced' 
  | 'paid' 
  | 'cancelled';

/**
 * Data required when creating or updating a work order
 * Excludes auto-generated fields like id, created_at, created_by
 */
export interface WorkOrderFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  property_id?: string;
  contractor_id?: string;
  estimated_cost?: number;
  actual_cost?: number;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  scope_of_work?: string;
  special_instructions?: string;
  attachments?: string[];
  completion_photos?: string[];
  invoice_attachments?: string[];
  requires_permits?: boolean;
  access_code?: string;
  sent_at?: string | null;
  acknowledged_at?: string | null;
  completed_at?: string | null;
  contractor_notes?: string;
  billing_type?: string;
  billing_rate?: number;
  hours_worked?: number;
  billing_amount?: number;
  payment_status?: string;
  paid_at?: string;
  payment_notes?: string;
  organization_id?: string;
}

/**
 * Status update data for work orders
 */
export interface WorkOrderStatusUpdate {
  status: WorkOrderStatus;
  sent_at?: string | null;
  acknowledged_at?: string | null;
  completed_at?: string | null;
}

// === Reservation Types ===

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'active' 
  | 'completed';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

/**
 * Data required when creating a reservation
 */
export interface ReservationCreateData {
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_amount?: number;
  currency?: string;
  booking_status?: BookingStatus;
  source_platform?: string;
  platform_data?: Record<string, unknown>;
  payment_status?: PaymentStatus;
  special_requests?: string;
  confirmation_code?: string;
  external_booking_id?: string;
}

/**
 * Data for updating an existing reservation
 */
export interface ReservationUpdateData {
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  check_in_date?: string;
  check_out_date?: string;
  guest_count?: number;
  total_amount?: number;
  currency?: string;
  booking_status?: string;
  payment_status?: string;
  special_requests?: string;
  platform_data?: Record<string, unknown>;
}

// === Pricing Types ===

export type PricingSource = 'base' | 'pricelabs' | 'manual';

/**
 * Data for updating dynamic pricing
 */
export interface DynamicPricingUpsertData {
  property_id: string;
  date: string;
  base_price: number;
  pricelabs_price?: number;
  manual_override_price?: number;
  final_price: number;
  pricing_source?: PricingSource;
  market_demand?: string;
  occupancy_rate?: number;
  special_events?: string[];
  min_stay?: number;
  min_price_limit?: number;
  max_price_limit?: number;
  checkin_allowed?: boolean;
  checkout_allowed?: boolean;
  currency?: string;
}

// === Availability Types ===

export type BlockType = 
  | 'booked' 
  | 'blocked' 
  | 'maintenance' 
  | 'owner_use';

export type SyncStatus = 
  | 'pending' 
  | 'synced' 
  | 'failed';

/**
 * Data for creating an availability block
 */
export interface AvailabilityBlockCreateData {
  property_id: string;
  start_date: string;
  end_date: string;
  block_type: BlockType;
  external_booking_id?: string;
  source_platform?: string;
  guest_count?: number;
  notes?: string;
  sync_status?: SyncStatus;
}

// === Settings Types ===

/**
 * Allowed types for setting values
 */
export type SettingValue = 
  | string 
  | number 
  | boolean 
  | null 
  | Record<string, unknown> 
  | unknown[];

/**
 * Type guard for setting values
 */
export function isValidSettingValue(value: unknown): value is SettingValue {
  if (value === null) return true;
  const type = typeof value;
  return (
    type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||
    (type === 'object' && value !== null)
  );
}

// === Webhook Types ===

/**
 * Webhook event data structure
 */
export interface WebhookEventData {
  platform: string;
  eventType: string;
  data: Record<string, unknown>;
}
