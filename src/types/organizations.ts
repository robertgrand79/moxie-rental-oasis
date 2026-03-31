export type TemplateType = 'single_property' | 'multi_property';

export type TemplateCategory = 'single' | 'multi' | 'luxury';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  custom_domain: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_template: boolean;
  is_template_source: boolean;
  template_type: TemplateType;
  template_category: TemplateCategory | null;
  // Non-secret identifiers (safe to expose)
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  stripe_connect_id: string | null;
  stripe_connect_status: string | null;
  payments_enabled: boolean | null;
  platform_fee_percent: number | null;
  turno_partner_id: string | null;
  openphone_phone_number: string | null;
  inbound_email_prefix: string | null;
  // Boolean flags for configured integrations (replaces raw secret fields)
  has_stripe_configured: boolean;
  has_stripe_publishable_configured: boolean;
  has_stripe_webhook_configured: boolean;
  has_pricelabs_configured: boolean;
  has_seam_configured: boolean;
  has_openphone_configured: boolean;
  has_resend_configured: boolean;
  has_turno_configured: boolean;
  has_openweather_configured: boolean;
  // Onboarding
  onboarding_completed: boolean | null;
  onboarding_step: string | null;
  // Domain
  domain_verification_status: string | null;
  domain_verified_at: string | null;
  domain_last_checked_at: string | null;
  domain_dns_records: any | null;
  // Template
  created_from_template_id: string | null;
  active_template_slug: string | null;
  // Archive
  archived_at: string | null;
  archived_by: string | null;
  archive_reason: string | null;
  // Subdomain
  subdomain_status: string | null;
  subdomain_error: string | null;
  cloudflare_hostname_id: string | null;
  // Subscription
  subscription_status: string;
  subscription_tier: string;
  trial_ends_at: string | null;
  // Comp
  is_comped: boolean | null;
  comped_tier: string | null;
  comped_until: string | null;
  comped_by: string | null;
  comped_at: string | null;
  comp_notes: string | null;
  // Discount
  discount_percent: number | null;
  discount_notes: string | null;
  discount_set_by: string | null;
  discount_set_at: string | null;
  stripe_coupon_id: string | null;
}

// The select string for querying organizations_safe view
// Use this everywhere instead of SELECT * on the organizations table
export const ORGANIZATION_SAFE_SELECT = `
  id, name, slug, logo_url, website, custom_domain,
  created_at, updated_at, is_active, is_template, is_template_source,
  template_type, template_category,
  stripe_account_id, stripe_customer_id, stripe_connect_id, stripe_connect_status,
  payments_enabled, platform_fee_percent,
  turno_partner_id, openphone_phone_number, inbound_email_prefix,
  has_stripe_configured, has_stripe_publishable_configured, has_stripe_webhook_configured,
  has_pricelabs_configured, has_seam_configured, has_openphone_configured,
  has_resend_configured, has_turno_configured, has_openweather_configured,
  onboarding_completed, onboarding_step,
  domain_verification_status, domain_verified_at, domain_last_checked_at, domain_dns_records,
  created_from_template_id, active_template_slug,
  archived_at, archived_by, archive_reason,
  subdomain_status, subdomain_error, cloudflare_hostname_id,
  subscription_status, subscription_tier, trial_ends_at,
  is_comped, comped_tier, comped_until, comped_by, comped_at, comp_notes,
  discount_percent, discount_notes, discount_set_by, discount_set_at, stripe_coupon_id
`.replace(/\s+/g, ' ').trim();

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  invited_by: string | null;
  joined_at: string;
  organization?: Organization;
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  logo_url?: string;
  website?: string;
  custom_domain?: string;
  turno_partner_id?: string;
  // Note: API keys are set via edge functions (useSecureApiKeys), not direct updates
  inbound_email_prefix?: string;
}

export interface InviteOrganizationMemberData {
  email: string;
  role: 'admin' | 'member';
}
