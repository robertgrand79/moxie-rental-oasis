/**
 * Audit log type definitions
 */

import { Json } from '@/integrations/supabase/types';

export interface AdminProfile {
  email: string;
}

export interface PlatformAuditLogEntry {
  id: string;
  created_at: string;
  admin_user_id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_name: string;
  target_id: string;
  ip_address: string;
  user_agent: string;
  session_id: string;
  details: Json;
  admin?: AdminProfile | null;
}
