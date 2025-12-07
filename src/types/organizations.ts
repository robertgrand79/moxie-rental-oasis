export type TemplateType = 'single_property' | 'multi_property';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_template: boolean;
  template_type: TemplateType;
  stripe_secret_key: string | null;
  stripe_publishable_key: string | null;
  stripe_webhook_secret: string | null;
  stripe_account_id: string | null;
  pricelabs_api_key: string | null;
  // Communications
  openphone_api_key: string | null;
  resend_api_key: string | null;
  // Smart Home
  seam_api_key: string | null;
  seam_webhook_secret: string | null;
  // Integrations
  turno_api_token: string | null;
  turno_api_secret: string | null;
  turno_partner_id: string | null;
  apify_api_key: string | null;
  openweather_api_key: string | null;
  // Subscription
  subscription_status: string;
  subscription_tier: string;
  trial_ends_at: string | null;
}

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
  stripe_secret_key?: string;
  stripe_publishable_key?: string;
  stripe_webhook_secret?: string;
  stripe_account_id?: string;
  pricelabs_api_key?: string;
  // Communications
  openphone_api_key?: string;
  resend_api_key?: string;
  // Smart Home
  seam_api_key?: string;
  seam_webhook_secret?: string;
  // Integrations
  turno_api_token?: string;
  turno_api_secret?: string;
  turno_partner_id?: string;
  apify_api_key?: string;
  openweather_api_key?: string;
}

export interface InviteOrganizationMemberData {
  email: string;
  role: 'admin' | 'member';
}
