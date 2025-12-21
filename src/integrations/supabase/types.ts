export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          organization_id: string
          priority: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          category: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          organization_id: string
          priority?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          organization_id?: string
          priority?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_type: string
          metric_value: Json
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          metric_type: string
          metric_value: Json
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metric_type?: string
          metric_value?: Json
        }
        Relationships: []
      }
      api_status: {
        Row: {
          created_at: string
          fallback_enabled: boolean
          id: string
          is_enabled: boolean
          last_checked_at: string | null
          last_error: string | null
          last_success_details: Json | null
          service_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fallback_enabled?: boolean
          id?: string
          is_enabled?: boolean
          last_checked_at?: string | null
          last_error?: string | null
          last_success_details?: Json | null
          service_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fallback_enabled?: boolean
          id?: string
          is_enabled?: boolean
          last_checked_at?: string | null
          last_error?: string | null
          last_success_details?: Json | null
          service_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      assistant_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          message_count: number | null
          metadata: Json | null
          organization_id: string
          session_id: string
          started_at: string
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          message_count?: number | null
          metadata?: Json | null
          organization_id: string
          session_id: string
          started_at?: string
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          message_count?: number | null
          metadata?: Json | null
          organization_id?: string
          session_id?: string
          started_at?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          tool_calls: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tool_calls?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_settings: {
        Row: {
          avatar_type: string | null
          bubble_color: string
          chat_style: string | null
          created_at: string
          custom_faqs: Json | null
          display_name: string
          id: string
          is_enabled: boolean
          organization_id: string
          personality: string | null
          updated_at: string
          welcome_message: string
        }
        Insert: {
          avatar_type?: string | null
          bubble_color?: string
          chat_style?: string | null
          created_at?: string
          custom_faqs?: Json | null
          display_name?: string
          id?: string
          is_enabled?: boolean
          organization_id: string
          personality?: string | null
          updated_at?: string
          welcome_message?: string
        }
        Update: {
          avatar_type?: string | null
          bubble_color?: string
          chat_style?: string | null
          created_at?: string
          custom_faqs?: Json | null
          display_name?: string
          id?: string
          is_enabled?: boolean
          organization_id?: string
          personality?: string | null
          updated_at?: string
          welcome_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          block_type: string
          created_at: string
          end_date: string
          external_booking_id: string | null
          guest_count: number | null
          id: string
          notes: string | null
          property_id: string
          source_platform: string | null
          start_date: string
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          block_type: string
          created_at?: string
          end_date: string
          external_booking_id?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          property_id: string
          source_platform?: string | null
          start_date: string
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          block_type?: string
          created_at?: string
          end_date?: string
          external_booking_id?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          property_id?: string
          source_platform?: string | null
          start_date?: string
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          activity_type: string | null
          address: string | null
          author: string
          category: string | null
          content: string
          content_type: string
          created_at: string
          created_by: string
          display_order: number | null
          end_date: string | null
          event_date: string | null
          excerpt: string
          id: string
          image_credit: string | null
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_recurring: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          metadata: Json | null
          organization_id: string | null
          phone: string | null
          price_range: string | null
          published_at: string | null
          rating: number | null
          recurrence_pattern: string | null
          slug: string
          status: string
          tags: string[] | null
          ticket_url: string | null
          time_end: string | null
          time_start: string | null
          title: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          activity_type?: string | null
          address?: string | null
          author: string
          category?: string | null
          content: string
          content_type?: string
          created_at?: string
          created_by: string
          display_order?: number | null
          end_date?: string | null
          event_date?: string | null
          excerpt: string
          id?: string
          image_credit?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_recurring?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          metadata?: Json | null
          organization_id?: string | null
          phone?: string | null
          price_range?: string | null
          published_at?: string | null
          rating?: number | null
          recurrence_pattern?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          ticket_url?: string | null
          time_end?: string | null
          time_start?: string | null
          title: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          activity_type?: string | null
          address?: string | null
          author?: string
          category?: string | null
          content?: string
          content_type?: string
          created_at?: string
          created_by?: string
          display_order?: number | null
          end_date?: string | null
          event_date?: string | null
          excerpt?: string
          id?: string
          image_credit?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_recurring?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          metadata?: Json | null
          organization_id?: string | null
          phone?: string | null
          price_range?: string | null
          published_at?: string | null
          rating?: number | null
          recurrence_pattern?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          ticket_url?: string | null
          time_end?: string | null
          time_start?: string | null
          title?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_charges: {
        Row: {
          amount: number
          charge_name: string
          charge_type: string
          created_at: string | null
          id: string
          reservation_id: string
          tax_rate_id: string | null
        }
        Insert: {
          amount: number
          charge_name: string
          charge_type: string
          created_at?: string | null
          id?: string
          reservation_id: string
          tax_rate_id?: string | null
        }
        Update: {
          amount?: number
          charge_name?: string
          charge_type?: string
          created_at?: string | null
          id?: string
          reservation_id?: string
          tax_rate_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_charges_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_charges_tax_rate_id_fkey"
            columns: ["tax_rate_id"]
            isOneToOne: false
            referencedRelation: "tax_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_type: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          end_time: string
          id: string
          notes: string | null
          space_id: string | null
          start_time: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_date: string
          booking_type?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          space_id?: string | null
          start_time: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_date?: string
          booking_type?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          space_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "office_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          email: string | null
          guest_name: string
          id: string
          last_message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          guest_name: string
          id?: string
          last_message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          guest_name?: string
          id?: string
          last_message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_updates: {
        Row: {
          archived_at: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          is_pinned: boolean
          publish_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          publish_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          publish_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuration_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          device_id: string | null
          id: string
          ip_address: string | null
          new_config: Json | null
          old_config: Json | null
          performed_by: string | null
          property_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          device_id?: string | null
          id?: string
          ip_address?: string | null
          new_config?: Json | null
          old_config?: Json | null
          performed_by?: string | null
          property_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          device_id?: string | null
          id?: string
          ip_address?: string | null
          new_config?: Json | null
          old_config?: Json | null
          performed_by?: string | null
          property_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      content_approval_items: {
        Row: {
          content: string
          created_at: string
          created_by: string
          feedback: string | null
          id: string
          original_prompt: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string
          feedback?: string | null
          id?: string
          original_prompt?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          feedback?: string | null
          id?: string
          original_prompt?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      contractor_access_tokens: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          is_active: boolean
          last_accessed_at: string | null
          token: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          token?: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_access_tokens_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          created_by: string
          default_billing_type: string | null
          email: string
          hourly_rate: number | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          rating: number | null
          sms_opt_in: boolean | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by: string
          default_billing_type?: string | null
          email: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          rating?: number | null
          sms_opt_in?: boolean | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string
          default_billing_type?: string | null
          email?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          rating?: number | null
          sms_opt_in?: boolean | null
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      device_automations: {
        Row: {
          actions: Json | null
          automation_name: string
          automation_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          property_id: string | null
          target_devices: string[] | null
          trigger_conditions: Json | null
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          automation_name: string
          automation_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          property_id?: string | null
          target_devices?: string[] | null
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          automation_name?: string
          automation_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          property_id?: string | null
          target_devices?: string[] | null
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_automations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_automations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      device_configurations: {
        Row: {
          battery_level: number | null
          configuration_data: Json | null
          connectivity_status: string | null
          created_at: string | null
          device_brand: string | null
          device_id: string
          device_model: string | null
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_locked: boolean | null
          last_active: string | null
          last_health_check: string | null
          last_seam_sync: string | null
          property_id: string
          registered_at: string | null
          seam_device_id: string | null
          seam_workspace_id: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          battery_level?: number | null
          configuration_data?: Json | null
          connectivity_status?: string | null
          created_at?: string | null
          device_brand?: string | null
          device_id: string
          device_model?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_locked?: boolean | null
          last_active?: string | null
          last_health_check?: string | null
          last_seam_sync?: string | null
          property_id: string
          registered_at?: string | null
          seam_device_id?: string | null
          seam_workspace_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          battery_level?: number | null
          configuration_data?: Json | null
          connectivity_status?: string | null
          created_at?: string | null
          device_brand?: string | null
          device_id?: string
          device_model?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_locked?: boolean | null
          last_active?: string | null
          last_health_check?: string | null
          last_seam_sync?: string | null
          property_id?: string
          registered_at?: string | null
          seam_device_id?: string | null
          seam_workspace_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_configurations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      device_events: {
        Row: {
          access_code_id: string | null
          created_at: string | null
          device_id: string | null
          event_data: Json | null
          event_source: string | null
          event_type: string
          id: string
          occurred_at: string | null
          triggered_by: string | null
        }
        Insert: {
          access_code_id?: string | null
          created_at?: string | null
          device_id?: string | null
          event_data?: Json | null
          event_source?: string | null
          event_type: string
          id?: string
          occurred_at?: string | null
          triggered_by?: string | null
        }
        Update: {
          access_code_id?: string | null
          created_at?: string | null
          device_id?: string | null
          event_data?: Json | null
          event_source?: string | null
          event_type?: string
          id?: string
          occurred_at?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_events_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "seam_access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "seam_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_events_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_maintenance_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          device_id: string | null
          id: string
          is_resolved: boolean | null
          message: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          work_order_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_resolved?: boolean | null
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          work_order_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_maintenance_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "seam_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_maintenance_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_maintenance_alerts_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing: {
        Row: {
          base_price: number
          checkin_allowed: boolean | null
          checkout_allowed: boolean | null
          created_at: string
          currency: string | null
          date: string
          final_price: number
          id: string
          last_synced_at: string | null
          manual_override_price: number | null
          market_demand: string | null
          max_price_limit: number | null
          min_price_limit: number | null
          min_stay: number | null
          occupancy_rate: number | null
          pricelabs_price: number | null
          pricing_source: string
          property_id: string
          special_events: string[] | null
          updated_at: string
        }
        Insert: {
          base_price: number
          checkin_allowed?: boolean | null
          checkout_allowed?: boolean | null
          created_at?: string
          currency?: string | null
          date: string
          final_price: number
          id?: string
          last_synced_at?: string | null
          manual_override_price?: number | null
          market_demand?: string | null
          max_price_limit?: number | null
          min_price_limit?: number | null
          min_stay?: number | null
          occupancy_rate?: number | null
          pricelabs_price?: number | null
          pricing_source?: string
          property_id: string
          special_events?: string[] | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          checkin_allowed?: boolean | null
          checkout_allowed?: boolean | null
          created_at?: string
          currency?: string | null
          date?: string
          final_price?: number
          id?: string
          last_synced_at?: string | null
          manual_override_price?: number | null
          market_demand?: string | null
          max_price_limit?: number | null
          min_price_limit?: number | null
          min_stay?: number | null
          occupancy_rate?: number | null
          pricelabs_price?: number | null
          pricing_source?: string
          property_id?: string
          special_events?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_pricing_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      eugene_events: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_recurring: boolean | null
          location: string | null
          organization_id: string
          place_id: string | null
          price_range: string | null
          recurrence_pattern: string | null
          status: string
          ticket_url: string | null
          time_end: string | null
          time_start: string | null
          title: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          organization_id: string
          place_id?: string | null
          price_range?: string | null
          recurrence_pattern?: string | null
          status?: string
          ticket_url?: string | null
          time_end?: string | null
          time_start?: string | null
          title: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          organization_id?: string
          place_id?: string | null
          price_range?: string | null
          recurrence_pattern?: string | null
          status?: string
          ticket_url?: string | null
          time_end?: string | null
          time_start?: string | null
          title?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eugene_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eugene_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendars: {
        Row: {
          api_credentials: Json | null
          calendar_url: string | null
          created_at: string
          external_property_id: string
          id: string
          last_sync_at: string | null
          platform: string
          property_id: string
          sync_enabled: boolean
          sync_errors: string[] | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          api_credentials?: Json | null
          calendar_url?: string | null
          created_at?: string
          external_property_id: string
          id?: string
          last_sync_at?: string | null
          platform: string
          property_id: string
          sync_enabled?: boolean
          sync_errors?: string[] | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          api_credentials?: Json | null
          calendar_url?: string | null
          created_at?: string
          external_property_id?: string
          id?: string
          last_sync_at?: string | null
          platform?: string
          property_id?: string
          sync_enabled?: boolean
          sync_errors?: string[] | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendars_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_events: {
        Row: {
          attendees: Json | null
          created_at: string
          description: string | null
          end_time: string | null
          event_data: Json
          google_calendar_id: string
          google_event_id: string
          id: string
          is_all_day: boolean | null
          last_synced_at: string
          location: string | null
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: Json | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_data: Json
          google_calendar_id: string
          google_event_id: string
          id?: string
          is_all_day?: boolean | null
          last_synced_at?: string
          location?: string | null
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: Json | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_data?: Json
          google_calendar_id?: string
          google_event_id?: string
          id?: string
          is_all_day?: boolean | null
          last_synced_at?: string
          location?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_sync_settings: {
        Row: {
          calendar_name: string
          created_at: string
          google_calendar_id: string
          id: string
          is_enabled: boolean | null
          last_sync_at: string | null
          sync_direction: string
          sync_task_types: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_name: string
          created_at?: string
          google_calendar_id: string
          id?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          sync_direction?: string
          sync_task_types?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_name?: string
          created_at?: string
          google_calendar_id?: string
          id?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          sync_direction?: string
          sync_task_types?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string | null
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token?: string | null
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string | null
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      guest_communications: {
        Row: {
          created_at: string
          delivery_status: string | null
          detected_language: string | null
          direction: string | null
          external_message_id: string | null
          id: string
          is_read: boolean | null
          message_content: string
          message_type: string
          original_content: string | null
          raw_email_data: Json | null
          raw_platform_data: Json | null
          reservation_id: string | null
          scheduled_for: string | null
          sender_email: string | null
          sent_at: string | null
          source_platform: string | null
          subject: string
          thread_id: string | null
          translated_language: string | null
        }
        Insert: {
          created_at?: string
          delivery_status?: string | null
          detected_language?: string | null
          direction?: string | null
          external_message_id?: string | null
          id?: string
          is_read?: boolean | null
          message_content: string
          message_type: string
          original_content?: string | null
          raw_email_data?: Json | null
          raw_platform_data?: Json | null
          reservation_id?: string | null
          scheduled_for?: string | null
          sender_email?: string | null
          sent_at?: string | null
          source_platform?: string | null
          subject: string
          thread_id?: string | null
          translated_language?: string | null
        }
        Update: {
          created_at?: string
          delivery_status?: string | null
          detected_language?: string | null
          direction?: string | null
          external_message_id?: string | null
          id?: string
          is_read?: boolean | null
          message_content?: string
          message_type?: string
          original_content?: string | null
          raw_email_data?: Json | null
          raw_platform_data?: Json | null
          reservation_id?: string | null
          scheduled_for?: string | null
          sender_email?: string | null
          sent_at?: string | null
          source_platform?: string | null
          subject?: string
          thread_id?: string | null
          translated_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_communications_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "property_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_communications_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "guest_inbox_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_inbox_threads: {
        Row: {
          ai_summary: string | null
          ai_summary_updated_at: string | null
          created_at: string
          detected_language: string | null
          guest_email: string | null
          guest_identifier: string
          guest_name: string | null
          guest_phone: string | null
          id: string
          is_read: boolean
          last_message_at: string | null
          last_message_preview: string | null
          organization_id: string
          reservation_count: number | null
          snoozed_until: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          ai_summary_updated_at?: string | null
          created_at?: string
          detected_language?: string | null
          guest_email?: string | null
          guest_identifier: string
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_read?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          organization_id: string
          reservation_count?: number | null
          snoozed_until?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          ai_summary_updated_at?: string | null
          created_at?: string
          detected_language?: string | null
          guest_email?: string | null
          guest_identifier?: string
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_read?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          organization_id?: string
          reservation_count?: number | null
          snoozed_until?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_inbox_threads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          guest_profile_id: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          reservation_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          guest_profile_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          reservation_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          guest_profile_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          reservation_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_notifications_guest_profile_id_fkey"
            columns: ["guest_profile_id"]
            isOneToOne: false
            referencedRelation: "guest_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_notifications_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "property_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          loyalty_points: number | null
          notification_settings: Json | null
          phone: string | null
          preferences: Json | null
          profile_image_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          loyalty_points?: number | null
          notification_settings?: Json | null
          phone?: string | null
          preferences?: Json | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          loyalty_points?: number | null
          notification_settings?: Json | null
          phone?: string | null
          preferences?: Json | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      guest_support_chats: {
        Row: {
          created_at: string
          guest_profile_id: string | null
          id: string
          priority: string | null
          reservation_id: string | null
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_profile_id?: string | null
          id?: string
          priority?: string | null
          reservation_id?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_profile_id?: string | null
          id?: string
          priority?: string | null
          reservation_id?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_support_chats_guest_profile_id_fkey"
            columns: ["guest_profile_id"]
            isOneToOne: false
            referencedRelation: "guest_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_support_chats_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "property_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_support_messages: {
        Row: {
          attachment_url: string | null
          chat_id: string
          created_at: string
          id: string
          message_content: string
          message_type: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          attachment_url?: string | null
          chat_id: string
          created_at?: string
          id?: string
          message_content: string
          message_type?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          attachment_url?: string | null
          chat_id?: string
          created_at?: string
          id?: string
          message_content?: string
          message_type?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_support_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "guest_support_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          is_primary_guest: boolean
          last_name: string
          phone: string | null
          reservation_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_primary_guest?: boolean
          last_name: string
          phone?: string | null
          reservation_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_primary_guest?: boolean
          last_name?: string
          phone?: string | null
          reservation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      home_amenities: {
        Row: {
          color: string
          created_at: string
          display_order: number
          icon_name: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_order?: number
          icon_name?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          display_order?: number
          icon_name?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_amenities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      image_optimization_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      image_performance_metrics: {
        Row: {
          bandwidth_saved_bytes: number | null
          connection_type: string | null
          created_at: string | null
          id: string
          image_url: string
          load_time_ms: number | null
          page_url: string | null
          user_agent: string | null
        }
        Insert: {
          bandwidth_saved_bytes?: number | null
          connection_type?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          load_time_ms?: number | null
          page_url?: string | null
          user_agent?: string | null
        }
        Update: {
          bandwidth_saved_bytes?: number | null
          connection_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          load_time_ms?: number | null
          page_url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      image_transformations: {
        Row: {
          accessed_count: number | null
          compression_ratio: number | null
          created_at: string | null
          file_size_optimized: number | null
          file_size_original: number | null
          format_optimized: string | null
          format_original: string | null
          id: string
          last_accessed_at: string | null
          optimized_url: string
          original_url: string
          transformation_params: Json
        }
        Insert: {
          accessed_count?: number | null
          compression_ratio?: number | null
          created_at?: string | null
          file_size_optimized?: number | null
          file_size_original?: number | null
          format_optimized?: string | null
          format_original?: string | null
          id?: string
          last_accessed_at?: string | null
          optimized_url: string
          original_url: string
          transformation_params: Json
        }
        Update: {
          accessed_count?: number | null
          compression_ratio?: number | null
          created_at?: string | null
          file_size_optimized?: number | null
          file_size_original?: number | null
          format_optimized?: string | null
          format_original?: string | null
          id?: string
          last_accessed_at?: string | null
          optimized_url?: string
          original_url?: string
          transformation_params?: Json
        }
        Relationships: []
      }
      lifestyle_gallery: {
        Row: {
          activity_type: string | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          organization_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_type?: string | null
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          organization_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          organization_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifestyle_gallery_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_checklist_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          template_id: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          template_id: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_checklist_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "maintenance_checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_checklist_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_system_template: boolean | null
          name: string
          organization_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          name: string
          organization_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          name?: string
          organization_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_checklist_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          property_id: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          property_id?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          property_id?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_rules: {
        Row: {
          ai_personalization: boolean | null
          ai_personalization_context: string | null
          created_at: string
          created_by: string | null
          delivery_channel: string
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          property_id: string | null
          template_id: string
          trigger_offset_hours: number
          trigger_time: string | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          ai_personalization?: boolean | null
          ai_personalization_context?: string | null
          created_at?: string
          created_by?: string | null
          delivery_channel?: string
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          property_id?: string | null
          template_id: string
          trigger_offset_hours?: number
          trigger_time?: string | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          ai_personalization?: boolean | null
          ai_personalization_context?: string | null
          created_at?: string
          created_by?: string | null
          delivery_channel?: string
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          property_id?: string | null
          template_id?: string
          trigger_offset_hours?: number
          trigger_time?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_rules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_analytics: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          location_data: Json | null
          subscriber_email: string
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          location_data?: Json | null
          subscriber_email: string
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          location_data?: Json | null
          subscriber_email?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaigns: {
        Row: {
          blog_post_id: string | null
          bounce_rate: number | null
          click_rate: number | null
          content: string
          cover_image_url: string | null
          created_at: string
          footer_config: Json | null
          header_config: Json | null
          id: string
          linked_content: Json | null
          open_rate: number | null
          recipient_count: number | null
          sent_at: string | null
          subject: string
          total_bounces: number | null
          total_clicks: number | null
          total_opens: number | null
          updated_at: string
        }
        Insert: {
          blog_post_id?: string | null
          bounce_rate?: number | null
          click_rate?: number | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          footer_config?: Json | null
          header_config?: Json | null
          id?: string
          linked_content?: Json | null
          open_rate?: number | null
          recipient_count?: number | null
          sent_at?: string | null
          subject: string
          total_bounces?: number | null
          total_clicks?: number | null
          total_opens?: number | null
          updated_at?: string
        }
        Update: {
          blog_post_id?: string | null
          bounce_rate?: number | null
          click_rate?: number | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          footer_config?: Json | null
          header_config?: Json | null
          id?: string
          linked_content?: Json | null
          open_rate?: number | null
          recipient_count?: number | null
          sent_at?: string | null
          subject?: string
          total_bounces?: number | null
          total_clicks?: number | null
          total_opens?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_click_tracking: {
        Row: {
          campaign_id: string | null
          click_count: number | null
          clicked_at: string | null
          created_at: string
          id: string
          original_url: string
          subscriber_email: string
          tracking_id: string
        }
        Insert: {
          campaign_id?: string | null
          click_count?: number | null
          clicked_at?: string | null
          created_at?: string
          id?: string
          original_url: string
          subscriber_email: string
          tracking_id: string
        }
        Update: {
          campaign_id?: string | null
          click_count?: number | null
          clicked_at?: string | null
          created_at?: string
          id?: string
          original_url?: string
          subscriber_email?: string
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_click_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          communication_preferences: Json | null
          contact_source: string | null
          created_at: string
          email: string
          email_opt_in: boolean | null
          id: string
          is_active: boolean
          last_engagement_date: string | null
          name: string | null
          phone: string | null
          preferences: Json | null
          sms_opt_in: boolean | null
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          communication_preferences?: Json | null
          contact_source?: string | null
          created_at?: string
          email: string
          email_opt_in?: boolean | null
          id?: string
          is_active?: boolean
          last_engagement_date?: string | null
          name?: string | null
          phone?: string | null
          preferences?: Json | null
          sms_opt_in?: boolean | null
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          communication_preferences?: Json | null
          contact_source?: string | null
          created_at?: string
          email?: string
          email_opt_in?: boolean | null
          id?: string
          is_active?: boolean
          last_engagement_date?: string | null
          name?: string | null
          phone?: string | null
          preferences?: Json | null
          sms_opt_in?: boolean | null
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_digest: boolean | null
          email_instant: boolean | null
          id: string
          in_app: boolean | null
          notification_type: string
          organization_id: string
          sms: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_digest?: boolean | null
          email_instant?: boolean | null
          id?: string
          in_app?: boolean | null
          notification_type: string
          organization_id: string
          sms?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_digest?: boolean | null
          email_instant?: boolean | null
          id?: string
          in_app?: boolean | null
          notification_type?: string
          organization_id?: string
          sms?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      office_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_type: string
          created_at: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          notes: string | null
          office_space_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_type?: string
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          office_space_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_type?: string
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          office_space_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "office_assignments_office_space_id_fkey"
            columns: ["office_space_id"]
            isOneToOne: false
            referencedRelation: "office_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      office_rentals: {
        Row: {
          company_name: string | null
          contract_signed_at: string | null
          created_at: string
          email: string
          end_date: string | null
          id: string
          monthly_price: number | null
          name: string
          notes: string | null
          office_space_id: string
          phone: string | null
          rental_type: string
          start_date: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          contract_signed_at?: string | null
          created_at?: string
          email: string
          end_date?: string | null
          id?: string
          monthly_price?: number | null
          name: string
          notes?: string | null
          office_space_id: string
          phone?: string | null
          rental_type?: string
          start_date?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          contract_signed_at?: string | null
          created_at?: string
          email?: string
          end_date?: string | null
          id?: string
          monthly_price?: number | null
          name?: string
          notes?: string | null
          office_space_id?: string
          phone?: string | null
          rental_type?: string
          start_date?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "office_rentals_office_space_id_fkey"
            columns: ["office_space_id"]
            isOneToOne: false
            referencedRelation: "office_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      office_spaces: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_available: boolean
          name: string
          price_per_day: number | null
          price_per_hour: number | null
          price_per_month: number | null
          size_sqft: number | null
          space_number: string | null
          space_type: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity: number
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_available?: boolean
          name: string
          price_per_day?: number | null
          price_per_hour?: number | null
          price_per_month?: number | null
          size_sqft?: number | null
          space_number?: string | null
          space_type?: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_available?: boolean
          name?: string
          price_per_day?: number | null
          price_per_hour?: number | null
          price_per_month?: number | null
          size_sqft?: number | null
          space_number?: string | null
          space_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          booking_id: string | null
          created_at: string
          currency: string | null
          id: string
          product_type: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          product_type?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          product_type?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_onboarding: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          organization_id: string
          step_name: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          organization_id: string
          step_name: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          organization_id?: string
          step_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_onboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          onboarding_step: number | null
          openphone_api_key: string | null
          openphone_phone_number: string | null
          openphone_webhook_secret: string | null
          openweather_api_key: string | null
          pricelabs_api_key: string | null
          resend_api_key: string | null
          seam_api_key: string | null
          seam_webhook_secret: string | null
          slug: string
          stripe_account_id: string | null
          stripe_customer_id: string | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          stripe_webhook_secret: string | null
          subscription_status: string | null
          subscription_tier: string | null
          template_type: string | null
          trial_ends_at: string | null
          turno_api_secret: string | null
          turno_api_token: string | null
          turno_partner_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          openphone_api_key?: string | null
          openphone_phone_number?: string | null
          openphone_webhook_secret?: string | null
          openweather_api_key?: string | null
          pricelabs_api_key?: string | null
          resend_api_key?: string | null
          seam_api_key?: string | null
          seam_webhook_secret?: string | null
          slug: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          template_type?: string | null
          trial_ends_at?: string | null
          turno_api_secret?: string | null
          turno_api_token?: string | null
          turno_partner_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          openphone_api_key?: string | null
          openphone_phone_number?: string | null
          openphone_webhook_secret?: string | null
          openweather_api_key?: string | null
          pricelabs_api_key?: string | null
          resend_api_key?: string | null
          seam_api_key?: string | null
          seam_webhook_secret?: string | null
          slug?: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          template_type?: string | null
          trial_ends_at?: string | null
          turno_api_secret?: string | null
          turno_api_token?: string | null
          turno_partner_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          organization_id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          organization_id: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          organization_id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string
          target_id: string
          target_name: string | null
          target_type: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by: string
          target_id: string
          target_name?: string | null
          target_type: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string
          target_id?: string
          target_name?: string | null
          target_type?: string
        }
        Relationships: []
      }
      place_categories: {
        Row: {
          color: string | null
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          activity_type: string | null
          address: string | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          display_order: number | null
          distance_from_properties: number | null
          driving_time: number | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          location_text: string | null
          longitude: number | null
          name: string
          organization_id: string
          phone: string | null
          price_level: number | null
          rating: number | null
          show_on_map: boolean | null
          status: string
          subcategory: string | null
          updated_at: string
          walking_time: number | null
          website_url: string | null
        }
        Insert: {
          activity_type?: string | null
          address?: string | null
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          display_order?: number | null
          distance_from_properties?: number | null
          driving_time?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          name: string
          organization_id: string
          phone?: string | null
          price_level?: number | null
          rating?: number | null
          show_on_map?: boolean | null
          status?: string
          subcategory?: string | null
          updated_at?: string
          walking_time?: number | null
          website_url?: string | null
        }
        Update: {
          activity_type?: string | null
          address?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          display_order?: number | null
          distance_from_properties?: number | null
          driving_time?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          name?: string
          organization_id?: string
          phone?: string | null
          price_level?: number | null
          rating?: number | null
          show_on_map?: boolean | null
          status?: string
          subcategory?: string | null
          updated_at?: string
          walking_time?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          is_secret: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          id?: string
          is_secret?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          is_secret?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      pricelabs_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          organization_id: string | null
          prices_synced: number | null
          property_id: string | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          organization_id?: string | null
          prices_synced?: number | null
          property_id?: string | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          organization_id?: string | null
          prices_synced?: number | null
          property_id?: string | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricelabs_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelabs_sync_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          adjustment_type: string
          adjustment_value: number
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          priority: number | null
          property_id: string
          rule_name: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          adjustment_type: string
          adjustment_value: number
          conditions: Json
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number | null
          property_id: string
          rule_name: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          adjustment_type?: string
          adjustment_value?: number
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number | null
          property_id?: string
          rule_name?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          onboarding_completed: boolean
          organization_id: string | null
          permissions: Json | null
          phone: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          onboarding_completed?: boolean
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          onboarding_completed?: boolean
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          priority: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          airbnb_listing_url: string | null
          amenities: string | null
          bathrooms: number
          bedrooms: number
          city: string | null
          cleaning_fee: number | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string
          display_order: number | null
          featured_photos: string[] | null
          id: string
          image_url: string | null
          images: string[] | null
          latitude: number | null
          location: string
          longitude: number | null
          max_guests: number
          organization_id: string | null
          price_per_night: number | null
          pricelabs_listing_id: string | null
          service_fee_percentage: number | null
          title: string
          updated_at: string
        }
        Insert: {
          airbnb_listing_url?: string | null
          amenities?: string | null
          bathrooms: number
          bedrooms: number
          city?: string | null
          cleaning_fee?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description: string
          display_order?: number | null
          featured_photos?: string[] | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          latitude?: number | null
          location: string
          longitude?: number | null
          max_guests: number
          organization_id?: string | null
          price_per_night?: number | null
          pricelabs_listing_id?: string | null
          service_fee_percentage?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          airbnb_listing_url?: string | null
          amenities?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string | null
          cleaning_fee?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string
          display_order?: number | null
          featured_photos?: string[] | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_guests?: number
          organization_id?: string | null
          price_per_night?: number | null
          pricelabs_listing_id?: string | null
          service_fee_percentage?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_access_details: {
        Row: {
          check_in_instructions: string | null
          created_at: string
          door_code: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          personal_message: string | null
          property_id: string
          updated_at: string
          wifi_name: string | null
          wifi_password: string | null
        }
        Insert: {
          check_in_instructions?: string | null
          created_at?: string
          door_code?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          personal_message?: string | null
          property_id: string
          updated_at?: string
          wifi_name?: string | null
          wifi_password?: string | null
        }
        Update: {
          check_in_instructions?: string | null
          created_at?: string
          door_code?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          personal_message?: string | null
          property_id?: string
          updated_at?: string
          wifi_name?: string | null
          wifi_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_access_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_analytics: {
        Row: {
          average_daily_rate: number | null
          booking_count: number | null
          cleaning_costs: number | null
          created_at: string
          date: string
          guest_count: number | null
          id: string
          maintenance_costs: number | null
          occupancy_rate: number | null
          property_id: string
          revenue: number | null
        }
        Insert: {
          average_daily_rate?: number | null
          booking_count?: number | null
          cleaning_costs?: number | null
          created_at?: string
          date: string
          guest_count?: number | null
          id?: string
          maintenance_costs?: number | null
          occupancy_rate?: number | null
          property_id: string
          revenue?: number | null
        }
        Update: {
          average_daily_rate?: number | null
          booking_count?: number | null
          cleaning_costs?: number | null
          created_at?: string
          date?: string
          guest_count?: number | null
          id?: string
          maintenance_costs?: number | null
          occupancy_rate?: number | null
          property_id?: string
          revenue?: number | null
        }
        Relationships: []
      }
      property_checklist_item_completions: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          item_id: string
          needs_work: boolean | null
          notes: string | null
          photos: string[] | null
          run_id: string
          work_order_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          item_id: string
          needs_work?: boolean | null
          notes?: string | null
          photos?: string[] | null
          run_id: string
          work_order_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          item_id?: string
          needs_work?: boolean | null
          notes?: string | null
          photos?: string[] | null
          run_id?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_checklist_item_completions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "maintenance_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_checklist_item_completions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "property_checklist_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_checklist_item_completions_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      property_checklist_runs: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          period: string
          property_id: string
          started_at: string | null
          status: string
          template_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          period: string
          property_id: string
          started_at?: string | null
          status?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          period?: string
          property_id?: string
          started_at?: string | null
          status?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_checklist_runs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_checklist_runs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "maintenance_checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          created_at: string
          document_type: string | null
          extracted_text: string | null
          file_path: string
          file_size: number | null
          id: string
          organization_id: string
          property_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          extracted_text?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          organization_id: string
          property_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string | null
          extracted_text?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          organization_id?: string
          property_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_fees: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          fee_amount: number
          fee_applies_to: string
          fee_name: string
          fee_type: string
          id: string
          is_active: boolean | null
          property_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          fee_amount: number
          fee_applies_to?: string
          fee_name: string
          fee_type?: string
          id?: string
          is_active?: boolean | null
          property_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          fee_amount?: number
          fee_applies_to?: string
          fee_name?: string
          fee_type?: string
          id?: string
          is_active?: boolean | null
          property_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_fees_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_guidebooks: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_active: boolean | null
          property_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          property_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          property_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_reservations: {
        Row: {
          booking_status: string
          check_in_date: string
          check_in_instructions: string | null
          check_out_date: string
          cleaning_status: string | null
          cleaning_work_order_id: string | null
          created_at: string
          currency: string | null
          guest_count: number
          guest_email: string
          guest_language: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          organization_id: string | null
          payment_status: string | null
          property_id: string
          source_platform: string | null
          special_requests: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_status?: string
          check_in_date: string
          check_in_instructions?: string | null
          check_out_date: string
          cleaning_status?: string | null
          cleaning_work_order_id?: string | null
          created_at?: string
          currency?: string | null
          guest_count?: number
          guest_email: string
          guest_language?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          organization_id?: string | null
          payment_status?: string | null
          property_id: string
          source_platform?: string | null
          special_requests?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          booking_status?: string
          check_in_date?: string
          check_in_instructions?: string | null
          check_out_date?: string
          cleaning_status?: string | null
          cleaning_work_order_id?: string | null
          created_at?: string
          currency?: string | null
          guest_count?: number
          guest_email?: string
          guest_language?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          organization_id?: string | null
          payment_status?: string | null
          property_id?: string
          source_platform?: string | null
          special_requests?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reservations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_stripe_credentials: {
        Row: {
          created_at: string
          id: string
          property_id: string
          stripe_account_id: string | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          stripe_webhook_secret: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          stripe_account_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          stripe_account_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_stripe_credentials_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_tax_assignments: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          property_id: string
          tax_rate_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          property_id: string
          tax_rate_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          property_id?: string
          tax_rate_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_tax_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tax_assignments_tax_rate_id_fkey"
            columns: ["tax_rate_id"]
            isOneToOne: false
            referencedRelation: "tax_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          id: string
          identifier: string
          operation_type: string
          request_count: number | null
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          identifier: string
          operation_type: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          identifier?: string
          operation_type?: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          base_price: number | null
          booking_status: string
          cancellation_policy: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          check_in_date: string
          check_out_date: string
          cleaning_fee: number | null
          confirmation_code: string
          created_at: string
          created_by: string
          external_booking_id: string | null
          external_platform: string | null
          guest_count: number
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          organization_id: string | null
          payment_status: string | null
          property_id: string
          service_fee: number | null
          special_instructions: string | null
          stripe_account_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          taxes: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          booking_status?: string
          cancellation_policy?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_date: string
          check_out_date: string
          cleaning_fee?: number | null
          confirmation_code: string
          created_at?: string
          created_by: string
          external_booking_id?: string | null
          external_platform?: string | null
          guest_count?: number
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          organization_id?: string | null
          payment_status?: string | null
          property_id: string
          service_fee?: number | null
          special_instructions?: string | null
          stripe_account_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          taxes?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          booking_status?: string
          cancellation_policy?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_date?: string
          check_out_date?: string
          cleaning_fee?: number | null
          confirmation_code?: string
          created_at?: string
          created_by?: string
          external_booking_id?: string | null
          external_platform?: string | null
          guest_count?: number
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          organization_id?: string | null
          payment_status?: string | null
          property_id?: string
          service_fee?: number | null
          special_instructions?: string | null
          stripe_account_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          taxes?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_role_permissions_permission_id"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "system_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_role_permissions_role_id"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "system_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "system_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "system_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          reservation_id: string
          rule_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          template_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          reservation_id: string
          rule_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          template_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          reservation_id?: string
          rule_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "property_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "messaging_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      seam_access_codes: {
        Row: {
          access_type: string | null
          code_name: string
          code_value: string | null
          created_at: string | null
          created_by: string | null
          device_id: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_usage_count: number | null
          reservation_id: string | null
          seam_access_code_id: string
          starts_at: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          access_type?: string | null
          code_name: string
          code_value?: string | null
          created_at?: string | null
          created_by?: string | null
          device_id?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_usage_count?: number | null
          reservation_id?: string | null
          seam_access_code_id: string
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          access_type?: string | null
          code_name?: string
          code_value?: string | null
          created_at?: string | null
          created_by?: string | null
          device_id?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_usage_count?: number | null
          reservation_id?: string | null
          seam_access_code_id?: string
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seam_access_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seam_access_codes_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "seam_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seam_access_codes_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "property_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      seam_devices: {
        Row: {
          battery_level: number | null
          battery_status: string | null
          capabilities: Json | null
          created_at: string | null
          current_state: Json | null
          device_brand: string
          device_model: string | null
          device_name: string
          device_properties: Json | null
          device_type: string
          firmware_version: string | null
          id: string
          is_online: boolean | null
          last_seen_at: string | null
          location: string | null
          property_id: string | null
          seam_device_id: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          battery_level?: number | null
          battery_status?: string | null
          capabilities?: Json | null
          created_at?: string | null
          current_state?: Json | null
          device_brand: string
          device_model?: string | null
          device_name: string
          device_properties?: Json | null
          device_type: string
          firmware_version?: string | null
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          property_id?: string | null
          seam_device_id: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          battery_level?: number | null
          battery_status?: string | null
          capabilities?: Json | null
          created_at?: string | null
          current_state?: Json | null
          device_brand?: string
          device_model?: string | null
          device_name?: string
          device_properties?: Json | null
          device_type?: string
          firmware_version?: string | null
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          property_id?: string | null
          seam_device_id?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seam_devices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seam_devices_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "seam_workspaces"
            referencedColumns: ["workspace_id"]
          },
        ]
      }
      seam_workspaces: {
        Row: {
          api_key_configured: boolean | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          property_id: string | null
          sync_status: string | null
          updated_at: string | null
          workspace_id: string
          workspace_name: string
        }
        Insert: {
          api_key_configured?: boolean | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          property_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          workspace_id: string
          workspace_name: string
        }
        Update: {
          api_key_configured?: boolean | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          property_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          workspace_id?: string
          workspace_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "seam_workspaces_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          resource: string | null
          risk_level: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          resource?: string | null
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          resource?: string | null
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      setup_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          device_limit: number | null
          expires_at: string
          id: string
          is_used: boolean | null
          property_id: string
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          device_limit?: number | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          property_id: string
          token: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          device_limit?: number | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          property_id?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          created_by: string
          id: string
          key: string
          organization_id: string | null
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          key: string
          organization_id?: string | null
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          key?: string
          organization_id?: string | null
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      site_templates: {
        Row: {
          annual_price_cents: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_properties: number | null
          monthly_price_cents: number
          name: string
          slug: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          annual_price_cents?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_properties?: number | null
          monthly_price_cents: number
          name: string
          slug: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_price_cents?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_properties?: number | null
          monthly_price_cents?: number
          name?: string
          slug?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          icon_name: string
          id: string
          is_active: boolean
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          icon_name: string
          id?: string
          is_active?: boolean
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          created_at: string
          data_synced: Json | null
          error_details: Json | null
          execution_time_ms: number | null
          id: string
          message: string | null
          platform: string
          property_id: string | null
          status: string
          sync_type: string
        }
        Insert: {
          created_at?: string
          data_synced?: Json | null
          error_details?: Json | null
          execution_time_ms?: number | null
          id?: string
          message?: string | null
          platform: string
          property_id?: string | null
          status: string
          sync_type: string
        }
        Update: {
          created_at?: string
          data_synced?: Json | null
          error_details?: Json | null
          execution_time_ms?: number | null
          id?: string
          message?: string | null
          platform?: string
          property_id?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_metadata: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string | null
          new_reviews_imported: number | null
          property_id: string
          sync_status: string
          sync_type: string
          total_reviews_found: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          new_reviews_imported?: number | null
          property_id: string
          sync_status?: string
          sync_type?: string
          total_reviews_found?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          new_reviews_imported?: number | null
          property_id?: string
          sync_status?: string
          sync_type?: string
          total_reviews_found?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_metadata_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      system_permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_roles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_system_role: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_system_role?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_system_role?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          property_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          property_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          property_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_rates: {
        Row: {
          created_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          jurisdiction: string
          jurisdiction_type: string
          tax_name: string
          tax_rate: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction: string
          jurisdiction_type: string
          tax_name: string
          tax_rate: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string
          jurisdiction_type?: string
          tax_name?: string
          tax_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          booking_platform: string | null
          content: string | null
          created_at: string
          created_by: string | null
          display_order: number | null
          external_review_id: string | null
          guest_avatar_url: string | null
          guest_location: string | null
          guest_name: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          property_id: string | null
          property_name: string | null
          rating: number
          review_text: string
          status: string | null
          stay_date: string | null
          updated_at: string
        }
        Insert: {
          booking_platform?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          external_review_id?: string | null
          guest_avatar_url?: string | null
          guest_location?: string | null
          guest_name: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          property_id?: string | null
          property_name?: string | null
          rating?: number
          review_text: string
          status?: string | null
          stay_date?: string | null
          updated_at?: string
        }
        Update: {
          booking_platform?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          external_review_id?: string | null
          guest_avatar_url?: string | null
          guest_location?: string | null
          guest_name?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          property_id?: string | null
          property_name?: string | null
          rating?: number
          review_text?: string
          status?: string | null
          stay_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tour_requests: {
        Row: {
          created_at: string
          email: string
          first_preferred_date: string
          first_preferred_time: string
          id: string
          message: string | null
          name: string
          phone: string | null
          second_preferred_date: string | null
          second_preferred_time: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_preferred_date: string
          first_preferred_time: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          second_preferred_date?: string | null
          second_preferred_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_preferred_date?: string
          first_preferred_time?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          second_preferred_date?: string | null
          second_preferred_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      turno_problems: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          last_sync_at: string
          linked_work_order_id: string | null
          metadata: Json | null
          priority: string
          property_address: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          room_location: string | null
          status: string
          sync_status: string
          title: string
          turno_created_at: string | null
          turno_problem_id: string
          turno_property_id: string
          turno_updated_at: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string
          linked_work_order_id?: string | null
          metadata?: Json | null
          priority?: string
          property_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          room_location?: string | null
          status?: string
          sync_status?: string
          title: string
          turno_created_at?: string | null
          turno_problem_id: string
          turno_property_id: string
          turno_updated_at?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string
          linked_work_order_id?: string | null
          metadata?: Json | null
          priority?: string
          property_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          room_location?: string | null
          status?: string
          sync_status?: string
          title?: string
          turno_created_at?: string | null
          turno_problem_id?: string
          turno_property_id?: string
          turno_updated_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_turno_problems_work_order"
            columns: ["linked_work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      turno_property_mapping: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          property_id: string | null
          property_name: string
          turno_property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          property_id?: string | null
          property_name: string
          turno_property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          property_id?: string | null
          property_name?: string
          turno_property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turno_property_mapping_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      turno_sync_log: {
        Row: {
          conflict_resolution: string | null
          created_at: string | null
          error_message: string | null
          id: string
          status_after: string | null
          status_before: string | null
          sync_details: Json | null
          sync_direction: string
          sync_status: string
          turno_api_response: Json | null
          work_order_id: string
        }
        Insert: {
          conflict_resolution?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          status_after?: string | null
          status_before?: string | null
          sync_details?: Json | null
          sync_direction: string
          sync_status: string
          turno_api_response?: Json | null
          work_order_id: string
        }
        Update: {
          conflict_resolution?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          status_after?: string | null
          status_before?: string | null
          sync_details?: Json | null
          sync_direction?: string
          sync_status?: string
          turno_api_response?: Json | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turno_sync_log_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string
          target_user_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by: string
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invitation_token: string
          invited_by: string
          organization_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invitation_token: string
          invited_by: string
          organization_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invitation_token?: string
          invited_by?: string
          organization_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "system_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_acknowledgement_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          work_order_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
          work_order_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_acknowledgement_tokens_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          contractor_id: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          token: string
          work_order_ids: string[]
        }
        Insert: {
          acknowledged_at?: string | null
          contractor_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          token: string
          work_order_ids: string[]
        }
        Update: {
          acknowledged_at?: string | null
          contractor_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          token?: string
          work_order_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "work_order_acknowledgments_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_acknowledgments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          notes: string | null
          status: string
          work_order_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          status: string
          work_order_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          status?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_status_history_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          access_code: string | null
          acknowledged_at: string | null
          actual_completion_date: string | null
          actual_cost: number | null
          attachments: string[] | null
          billing_amount: number | null
          billing_rate: number | null
          billing_type: string | null
          completed_at: string | null
          completion_photos: string[] | null
          contractor_id: string | null
          contractor_notes: string | null
          created_at: string
          created_by: string | null
          description: string
          estimated_completion_date: string | null
          estimated_cost: number | null
          hours_worked: number | null
          id: string
          invoice_attachments: string[] | null
          organization_id: string | null
          paid_at: string | null
          payment_notes: string | null
          payment_status: string | null
          priority: string
          property_id: string | null
          requires_permits: boolean | null
          scope_of_work: string | null
          sent_at: string | null
          source: string
          special_instructions: string | null
          status: string
          title: string
          updated_at: string
          work_order_number: string
        }
        Insert: {
          access_code?: string | null
          acknowledged_at?: string | null
          actual_completion_date?: string | null
          actual_cost?: number | null
          attachments?: string[] | null
          billing_amount?: number | null
          billing_rate?: number | null
          billing_type?: string | null
          completed_at?: string | null
          completion_photos?: string[] | null
          contractor_id?: string | null
          contractor_notes?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          estimated_completion_date?: string | null
          estimated_cost?: number | null
          hours_worked?: number | null
          id?: string
          invoice_attachments?: string[] | null
          organization_id?: string | null
          paid_at?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          priority?: string
          property_id?: string | null
          requires_permits?: boolean | null
          scope_of_work?: string | null
          sent_at?: string | null
          source?: string
          special_instructions?: string | null
          status?: string
          title: string
          updated_at?: string
          work_order_number: string
        }
        Update: {
          access_code?: string | null
          acknowledged_at?: string | null
          actual_completion_date?: string | null
          actual_cost?: number | null
          attachments?: string[] | null
          billing_amount?: number | null
          billing_rate?: number | null
          billing_type?: string | null
          completed_at?: string | null
          completion_photos?: string[] | null
          contractor_id?: string | null
          contractor_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          estimated_completion_date?: string | null
          estimated_cost?: number | null
          hours_worked?: number | null
          id?: string
          invoice_attachments?: string[] | null
          organization_id?: string | null
          paid_at?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          priority?: string
          property_id?: string | null
          requires_permits?: boolean | null
          scope_of_work?: string | null
          sent_at?: string | null
          source?: string
          special_instructions?: string | null
          status?: string
          title?: string
          updated_at?: string
          work_order_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_community_updates: { Args: never; Returns: undefined }
      can_access_organization: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_property: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_organization: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_property: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_users: { Args: never; Returns: boolean }
      can_update_user_role: {
        Args: { new_role: string; old_role: string; target_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          identifier: string
          max_requests?: number
          operation_type: string
          window_minutes?: number
        }
        Returns: boolean
      }
      create_organization_with_owner: {
        Args: {
          _name: string
          _slug: string
          _template_id?: string
          _user_id: string
        }
        Returns: string
      }
      create_reservation_with_lock: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_guest_count: number
          p_guest_email: string
          p_guest_name: string
          p_guest_phone: string
          p_payment_status: string
          p_property_id: string
          p_stripe_session_id: string
          p_total_amount: number
        }
        Returns: Json
      }
      generate_work_order_number: { Args: never; Returns: string }
      get_or_create_contractor_token: {
        Args: { p_contractor_id: string }
        Returns: string
      }
      get_or_create_inbox_thread: {
        Args: {
          p_guest_email: string
          p_guest_name?: string
          p_guest_phone?: string
          p_organization_id: string
        }
        Returns: string
      }
      get_organization_by_identifier: {
        Args: { _identifier: string }
        Returns: {
          custom_domain: string
          id: string
          is_active: boolean
          logo_url: string
          name: string
          slug: string
          template_type: string
          website: string
        }[]
      }
      get_primary_template_organization: {
        Args: never
        Returns: {
          custom_domain: string
          id: string
          is_active: boolean
          logo_url: string
          name: string
          slug: string
          template_type: string
          website: string
        }[]
      }
      get_property_organization_id: {
        Args: { _property_id: string }
        Returns: string
      }
      get_property_stripe_credentials: {
        Args: { p_property_id: string }
        Returns: {
          stripe_account_id: string
          stripe_publishable_key: string
          stripe_secret_key: string
          stripe_webhook_secret: string
        }[]
      }
      get_reservation_by_id_and_email: {
        Args: { p_guest_email: string; p_reservation_id: string }
        Returns: {
          booking_status: string
          check_in_date: string
          check_in_instructions: string
          check_out_date: string
          created_at: string
          guest_count: number
          guest_name: string
          id: string
          payment_status: string
          property_id: string
          special_requests: string
          total_amount: number
        }[]
      }
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_platform_role: {
        Args: {
          _role: Database["public"]["Enums"]["platform_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_platform_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_slug_available: { Args: { _slug: string }; Returns: boolean }
      refresh_office_space_availability: {
        Args: { p_office_space_id: string }
        Returns: undefined
      }
      turno_sync_properties: { Args: never; Returns: undefined }
      update_user_last_login: { Args: { user_id: string }; Returns: undefined }
      user_belongs_to_organization: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { permission_key: string; user_id: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
      user_is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      platform_role: "super_admin" | "support" | "billing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      platform_role: ["super_admin", "support", "billing"],
    },
  },
} as const
