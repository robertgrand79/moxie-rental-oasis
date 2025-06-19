
export interface NewsletterFormData {
  email: string;
  name: string;
  phone?: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
  communicationPreferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    preferredTime: 'morning' | 'afternoon' | 'evening';
  };
}

export interface EnhancedSubscriber {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  is_active: boolean;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  communication_preferences: {
    frequency: string;
    preferred_time: string;
  };
  contact_source: string;
  subscribed_at: string;
  last_engagement_date: string | null;
  preferences: any;
}

// Add missing interface exports
export interface NewsletterFormProps {
  onSubmit: (data: NewsletterFormData) => Promise<void>;
  isLoading: boolean;
}

export interface NewsletterSuccessProps {
  userName: string;
}

// Add interface for Add Subscriber Modal
export interface AddSubscriberFormData {
  email: string;
  name: string;
  phone?: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
  communicationPreferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    preferredTime: 'morning' | 'afternoon' | 'evening';
  };
  contactSource: string;
}
