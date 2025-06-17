
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

export interface CustomTaskType {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  is_active: boolean;
  is_system: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
  assigned_by: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
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
  assigned_to?: string; // Legacy field - will be deprecated
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  is_recurring: boolean;
  recurrence_pattern?: string; // Legacy field
  recurrence_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval?: number;
  recurrence_end_date?: string;
  task_type_id?: string;
  checklist_items?: string[];
  photos?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  project?: PropertyProject;
  task_type?: CustomTaskType;
  assignments?: TaskAssignment[];
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

export interface BulkTaskOperation {
  type: 'delete' | 'status_change' | 'assign' | 'priority_change';
  taskIds: string[];
  data?: {
    status?: PropertyTask['status'];
    priority?: PropertyTask['priority'];
    userIds?: string[];
  };
}
