export interface TurnoProblem {
  id: string;
  turno_problem_id: string;
  turno_property_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  room_location?: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  property_address?: string;
  turno_created_at?: string;
  turno_updated_at?: string;
  linked_work_order_id?: string;
  sync_status: string;
  last_sync_at: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Extended fields for UI
  linked_work_order?: {
    id: string;
    work_order_number: string;
    status: string;
  };
  turno_property_data?: {
    id: string;
    name: string;
    address?: string;
  };
}

export interface TurnoProblemsFilters {
  status?: string;
  priority?: string;
  category?: string;
  sync_status?: string;
  property_id?: string;
  search?: string;
  has_work_order?: boolean;
}

export interface TurnoProblemsStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  linked_to_work_orders: number;
  sync_conflicts: number;
  last_sync_at?: string;
}