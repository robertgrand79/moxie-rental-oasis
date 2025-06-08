
export interface NewsletterFormData {
  email: string;
  name: string;
}

export interface NewsletterFormProps {
  onSubmit: (data: NewsletterFormData) => Promise<void>;
  isLoading: boolean;
}

export interface NewsletterSuccessProps {
  userName?: string;
}
