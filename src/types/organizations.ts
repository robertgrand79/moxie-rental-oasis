export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  stripe_secret_key: string | null;
  stripe_publishable_key: string | null;
  stripe_webhook_secret: string | null;
  stripe_account_id: string | null;
  pricelabs_api_key: string | null;
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
}

export interface InviteOrganizationMemberData {
  email: string;
  role: 'admin' | 'member';
}
