
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserInvitation {
  email: string;
  role: string;
  full_name?: string;
}
