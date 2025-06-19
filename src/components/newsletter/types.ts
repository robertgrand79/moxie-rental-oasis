
export interface NewsletterFormData {
  email: string;
  name: string;
  phone?: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
  communicationPreferences: {
    frequency: string;
    preferred_time: string;
  };
}

export interface BasicNewsletterFormData {
  email: string;
  name: string;
}

export interface AddSubscriberFormData extends NewsletterFormData {
  contactSource: string;
}

export interface NewsletterFormProps {
  onSubmit: (data: BasicNewsletterFormData) => Promise<void>;
  isLoading: boolean;
}

export interface EnhancedSubscriber {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  is_active: boolean;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  communication_preferences: {
    frequency: string;
    preferred_time: string;
  };
  contact_source: string;
  subscribed_at: string;
  created_at: string;
  updated_at: string;
  last_engagement_date?: string;
}
