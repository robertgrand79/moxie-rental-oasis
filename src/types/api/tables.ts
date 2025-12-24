/**
 * Table-specific type exports from Supabase schema
 * Re-exports commonly used table types for cleaner imports
 */

import { Database } from '@/integrations/supabase/types';

// ============================================
// Table Row Types (Read)
// ============================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type Reservation = Database['public']['Tables']['reservations']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type SiteSetting = Database['public']['Tables']['site_settings']['Row'];
export type WorkOrder = Database['public']['Tables']['work_orders']['Row'];
export type Contractor = Database['public']['Tables']['contractors']['Row'];
export type Guest = Database['public']['Tables']['guests']['Row'];
export type AvailabilityBlock = Database['public']['Tables']['availability_blocks']['Row'];
export type DynamicPricing = Database['public']['Tables']['dynamic_pricing']['Row'];
export type AssistantSettings = Database['public']['Tables']['assistant_settings']['Row'];
export type AssistantConversation = Database['public']['Tables']['assistant_conversations']['Row'];
export type AssistantMessage = Database['public']['Tables']['assistant_messages']['Row'];
export type AssistantEscalation = Database['public']['Tables']['assistant_escalations']['Row'];
export type GuestCommunication = Database['public']['Tables']['guest_communications']['Row'];
export type GuestInboxThread = Database['public']['Tables']['guest_inbox_threads']['Row'];
export type GuestProfile = Database['public']['Tables']['guest_profiles']['Row'];
export type NewsletterCampaign = Database['public']['Tables']['newsletter_campaigns']['Row'];
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];
export type CommunityUpdate = Database['public']['Tables']['community_updates']['Row'];
export type ExternalCalendar = Database['public']['Tables']['external_calendars']['Row'];
export type PropertyFee = Database['public']['Tables']['property_fees']['Row'];
export type SeamDevice = Database['public']['Tables']['seam_devices']['Row'];
export type SeamAccessCode = Database['public']['Tables']['seam_access_codes']['Row'];
export type AdminNotification = Database['public']['Tables']['admin_notifications']['Row'];
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];
export type ErrorLog = Database['public']['Tables']['error_logs']['Row'];
export type HelpArticle = Database['public']['Tables']['help_articles']['Row'];
export type HelpCategory = Database['public']['Tables']['help_categories']['Row'];
export type Place = Database['public']['Tables']['places']['Row'];
export type EugeneEvent = Database['public']['Tables']['eugene_events']['Row'];
export type LifestyleGallery = Database['public']['Tables']['lifestyle_gallery']['Row'];

// ============================================
// Table Insert Types (Create)
// ============================================

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type OrganizationMemberInsert = Database['public']['Tables']['organization_members']['Insert'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert'];
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
export type SiteSettingInsert = Database['public']['Tables']['site_settings']['Insert'];
export type WorkOrderInsert = Database['public']['Tables']['work_orders']['Insert'];
export type ContractorInsert = Database['public']['Tables']['contractors']['Insert'];
export type GuestInsert = Database['public']['Tables']['guests']['Insert'];
export type AvailabilityBlockInsert = Database['public']['Tables']['availability_blocks']['Insert'];
export type DynamicPricingInsert = Database['public']['Tables']['dynamic_pricing']['Insert'];
export type AssistantSettingsInsert = Database['public']['Tables']['assistant_settings']['Insert'];
export type GuestCommunicationInsert = Database['public']['Tables']['guest_communications']['Insert'];
export type NewsletterCampaignInsert = Database['public']['Tables']['newsletter_campaigns']['Insert'];
export type NewsletterSubscriberInsert = Database['public']['Tables']['newsletter_subscribers']['Insert'];
export type CommunityUpdateInsert = Database['public']['Tables']['community_updates']['Insert'];
export type AdminNotificationInsert = Database['public']['Tables']['admin_notifications']['Insert'];
export type AnalyticsEventInsert = Database['public']['Tables']['analytics_events']['Insert'];
export type ErrorLogInsert = Database['public']['Tables']['error_logs']['Insert'];
export type PlaceInsert = Database['public']['Tables']['places']['Insert'];
export type EugeneEventInsert = Database['public']['Tables']['eugene_events']['Insert'];

// ============================================
// Table Update Types (Modify)
// ============================================

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];
export type OrganizationMemberUpdate = Database['public']['Tables']['organization_members']['Update'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update'];
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];
export type SiteSettingUpdate = Database['public']['Tables']['site_settings']['Update'];
export type WorkOrderUpdate = Database['public']['Tables']['work_orders']['Update'];
export type ContractorUpdate = Database['public']['Tables']['contractors']['Update'];
export type GuestUpdate = Database['public']['Tables']['guests']['Update'];
export type AvailabilityBlockUpdate = Database['public']['Tables']['availability_blocks']['Update'];
export type DynamicPricingUpdate = Database['public']['Tables']['dynamic_pricing']['Update'];
export type AssistantSettingsUpdate = Database['public']['Tables']['assistant_settings']['Update'];
export type GuestCommunicationUpdate = Database['public']['Tables']['guest_communications']['Update'];
export type AdminNotificationUpdate = Database['public']['Tables']['admin_notifications']['Update'];
export type PlaceUpdate = Database['public']['Tables']['places']['Update'];
export type EugeneEventUpdate = Database['public']['Tables']['eugene_events']['Update'];

// ============================================
// Common Joined/Nested Types
// ============================================

/**
 * Organization with membership info
 */
export interface OrganizationWithMembership extends Organization {
  organization_members?: OrganizationMember[];
}

/**
 * Property with organization info
 */
export interface PropertyWithOrganization extends Property {
  organization?: Organization;
}

/**
 * Reservation with property and guest info
 */
export interface ReservationWithDetails extends Reservation {
  property?: Property;
  guests?: Guest[];
}

/**
 * Work order with property and contractor info
 */
export interface WorkOrderWithDetails extends WorkOrder {
  property?: Property;
  contractor?: Contractor;
}

/**
 * Guest communication with thread info
 */
export interface GuestCommunicationWithThread extends GuestCommunication {
  thread?: GuestInboxThread;
}

/**
 * Newsletter campaign with analytics
 */
export interface NewsletterCampaignWithStats extends NewsletterCampaign {
  subscriber_count?: number;
  analytics?: {
    opens: number;
    clicks: number;
    bounces: number;
  };
}

/**
 * Blog post with author profile
 */
export interface BlogPostWithAuthor extends BlogPost {
  author_profile?: Profile;
}

/**
 * Place with events
 */
export interface PlaceWithEvents extends Place {
  events?: EugeneEvent[];
}
