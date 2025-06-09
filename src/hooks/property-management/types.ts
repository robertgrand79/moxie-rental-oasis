
import { Property } from '@/types/property';

export interface PropertyProject {
  id: string;
  property_id: string;
  title: string;
  description?: string;
  type: 'maintenance' | 'turnover' | 'inspection' | 'repair' | 'improvement';
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  budget?: number;
  actual_cost?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface PropertyTask {
  id: string;
  property_id?: string;
  project_id?: string;
  title: string;
  description?: string;
  type: 'cleaning' | 'maintenance' | 'inspection' | 'repair' | 'supply_order' | 'guest_service' | 'admin';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  is_recurring: boolean;
  recurrence_pattern?: string;
  checklist_items?: string[];
  photos?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  project?: PropertyProject;
}

export interface MaintenanceSchedule {
  id: string;
  property_id: string;
  task_type: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  next_due_date: string;
  last_completed?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
