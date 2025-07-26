export interface TurnoProperty {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  timezone?: string;
  cleaner?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

export interface TurnoPropertyMapping {
  id: string;
  property_id?: string;
  turno_property_id: string;
  property_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields for UI
  turno_property_data?: TurnoProperty;
  property?: {
    id: string;
    title: string;
    location: string;
  };
}

export interface PropertyMappingStatus {
  propertyId: string;
  isMapped: boolean;
  turnoPropertyId?: string;
  turnoPropertyName?: string;
  lastSyncedAt?: string;
  mappingStatus?: 'active' | 'inactive' | 'pending';
}

export interface TurnoSyncStats {
  totalProperties: number;
  mappedProperties: number;
  unmappedProperties: number;
  lastSyncAt?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}