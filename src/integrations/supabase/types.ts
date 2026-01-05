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
      account_lockouts: {
        Row: {
          created_at: string
          email: string
          failed_attempts: number
          id: string
          last_failed_at: string | null
          locked_until: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          failed_attempts?: number
          id?: string
          last_failed_at?: string | null
          locked_until?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          failed_attempts?: number
          id?: string
          last_failed_at?: string | null
          locked_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
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
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_impersonation_sessions: {
        Row: {
          actions_taken: Json | null
          admin_user_id: string
          ended_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          started_at: string | null
          target_organization_id: string
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          actions_taken?: Json | null
          admin_user_id: string
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          started_at?: string | null
          target_organization_id: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          actions_taken?: Json | null
          admin_user_id?: string
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          started_at?: string | null
          target_organization_id?: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_impersonation_sessions_target_organization_id_fkey"
            columns: ["target_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_impersonation_sessions_target_organization_id_fkey"
            columns: ["target_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string | null
          escalated_at: string | null
          escalation_sent: boolean | null
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
          escalated_at?: string | null
          escalation_sent?: boolean | null
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
          escalated_at?: string | null
          escalation_sent?: boolean | null
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
            foreignKeyName: "admin_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          organization_id: string | null
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          organization_id?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          organization_id?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
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
      application_logs: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          level: string
          message: string
          tags: string[] | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          level?: string
          message: string
          tags?: string[] | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          level?: string
          message?: string
          tags?: string[] | null
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
          {
            foreignKeyName: "assistant_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_escalations: {
        Row: {
          add_to_faq: boolean | null
          answered_at: string | null
          answered_by: string | null
          conversation_context: Json | null
          conversation_id: string | null
          created_at: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          guest_question: string
          host_response: string | null
          id: string
          notified_at: string | null
          organization_id: string
          property_id: string | null
          session_id: string
          status: string
        }
        Insert: {
          add_to_faq?: boolean | null
          answered_at?: string | null
          answered_by?: string | null
          conversation_context?: Json | null
          conversation_id?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guest_question: string
          host_response?: string | null
          id?: string
          notified_at?: string | null
          organization_id: string
          property_id?: string | null
          session_id: string
          status?: string
        }
        Update: {
          add_to_faq?: boolean | null
          answered_at?: string | null
          answered_by?: string | null
          conversation_context?: Json | null
          conversation_id?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guest_question?: string
          host_response?: string | null
          id?: string
          notified_at?: string | null
          organization_id?: string
          property_id?: string | null
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_escalations_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_escalations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_escalations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_escalations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_escalations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
          organization_id: string | null
          role: string
          tool_calls: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          organization_id?: string | null
          role: string
          tool_calls?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          organization_id?: string | null
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
          {
            foreignKeyName: "assistant_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_settings: {
        Row: {
          assistant_message_bg_color: string | null
          avatar_background_color: string | null
          avatar_background_color_end: string | null
          avatar_type: string | null
          bubble_color: string
          chat_style: string | null
          created_at: string
          custom_avatar_url: string | null
          custom_faqs: Json | null
          display_name: string
          id: string
          is_enabled: boolean
          organization_id: string
          personality: string | null
          submit_button_color: string | null
          text_color: string | null
          tv_chat_enabled: boolean | null
          tv_show_avatar: boolean | null
          tv_signage_rotation_seconds: number | null
          tv_welcome_message: string | null
          updated_at: string
          use_custom_avatar: boolean | null
          user_message_text_color: string | null
          welcome_message: string
        }
        Insert: {
          assistant_message_bg_color?: string | null
          avatar_background_color?: string | null
          avatar_background_color_end?: string | null
          avatar_type?: string | null
          bubble_color?: string
          chat_style?: string | null
          created_at?: string
          custom_avatar_url?: string | null
          custom_faqs?: Json | null
          display_name?: string
          id?: string
          is_enabled?: boolean
          organization_id: string
          personality?: string | null
          submit_button_color?: string | null
          text_color?: string | null
          tv_chat_enabled?: boolean | null
          tv_show_avatar?: boolean | null
          tv_signage_rotation_seconds?: number | null
          tv_welcome_message?: string | null
          updated_at?: string
          use_custom_avatar?: boolean | null
          user_message_text_color?: string | null
          welcome_message?: string
        }
        Update: {
          assistant_message_bg_color?: string | null
          avatar_background_color?: string | null
          avatar_background_color_end?: string | null
          avatar_type?: string | null
          bubble_color?: string
          chat_style?: string | null
          created_at?: string
          custom_avatar_url?: string | null
          custom_faqs?: Json | null
          display_name?: string
          id?: string
          is_enabled?: boolean
          organization_id?: string
          personality?: string | null
          submit_button_color?: string | null
          text_color?: string | null
          tv_chat_enabled?: boolean | null
          tv_show_avatar?: boolean | null
          tv_signage_rotation_seconds?: number | null
          tv_welcome_message?: string | null
          updated_at?: string
          use_custom_avatar?: boolean | null
          user_message_text_color?: string | null
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
          {
            foreignKeyName: "assistant_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string
          source_platform?: string | null
          start_date?: string
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
          {
            foreignKeyName: "blog_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
      calendar_sync_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          events_removed: number | null
          events_synced: number | null
          external_calendar_id: string | null
          id: string
          organization_id: string | null
          platform: string
          property_id: string | null
          status: string
          sync_type: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          events_removed?: number | null
          events_synced?: number | null
          external_calendar_id?: string | null
          id?: string
          organization_id?: string | null
          platform: string
          property_id?: string | null
          status?: string
          sync_type?: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          events_removed?: number | null
          events_synced?: number | null
          external_calendar_id?: string | null
          id?: string
          organization_id?: string | null
          platform?: string
          property_id?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_logs_external_calendar_id_fkey"
            columns: ["external_calendar_id"]
            isOneToOne: false
            referencedRelation: "external_calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          organization_id: string | null
          sender: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          organization_id?: string | null
          sender: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          organization_id?: string | null
          sender?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          guest_name: string
          id?: string
          last_message?: string | null
          organization_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          guest_name?: string
          id?: string
          last_message?: string | null
          organization_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          publish_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_updates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_updates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          performed_by?: string | null
          property_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuration_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configuration_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      content_approval_items: {
        Row: {
          content: string
          created_at: string
          created_by: string
          feedback: string | null
          id: string
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          original_prompt?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_approval_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_approval_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_access_tokens: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          is_active: boolean
          last_accessed_at: string | null
          organization_id: string | null
          token: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          organization_id?: string | null
          token?: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          organization_id?: string | null
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
          {
            foreignKeyName: "contractor_access_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_access_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
          {
            foreignKeyName: "contractors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_funnels: {
        Row: {
          completed_at: string | null
          created_at: string
          dropped_at: string | null
          funnel_name: string
          id: string
          organization_id: string | null
          properties: Json | null
          session_id: string | null
          step_name: string
          step_number: number
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dropped_at?: string | null
          funnel_name: string
          id?: string
          organization_id?: string | null
          properties?: Json | null
          session_id?: string | null
          step_name: string
          step_number: number
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dropped_at?: string | null
          funnel_name?: string
          id?: string
          organization_id?: string | null
          properties?: Json | null
          session_id?: string | null
          step_name?: string
          step_number?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversion_funnels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_funnels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "device_automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "device_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "device_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "device_maintenance_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_maintenance_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          pricelabs_price?: number | null
          pricing_source?: string
          property_id?: string
          special_events?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_pricing_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_pricing_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_pricing_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      email_failures: {
        Row: {
          created_at: string
          email_type: string
          error_code: string | null
          error_message: string
          id: string
          max_retries: number
          next_retry_at: string | null
          organization_id: string | null
          payload: Json
          recipient_email: string
          retry_count: number
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_code?: string | null
          error_message: string
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          organization_id?: string | null
          payload?: Json
          recipient_email: string
          retry_count?: number
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_code?: string | null
          error_message?: string
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          organization_id?: string | null
          payload?: Json
          recipient_email?: string
          retry_count?: number
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_failures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_failures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          breadcrumbs: Json | null
          context: Json | null
          created_at: string
          error_id: string
          fingerprint: string
          id: string
          message: string
          resolved: boolean | null
          severity: string
          stack: string | null
          tags: string[] | null
          type: string
          url: string | null
          user_agent: string | null
        }
        Insert: {
          breadcrumbs?: Json | null
          context?: Json | null
          created_at?: string
          error_id: string
          fingerprint: string
          id?: string
          message: string
          resolved?: boolean | null
          severity?: string
          stack?: string | null
          tags?: string[] | null
          type?: string
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          breadcrumbs?: Json | null
          context?: Json | null
          created_at?: string
          error_id?: string
          fingerprint?: string
          id?: string
          message?: string
          resolved?: boolean | null
          severity?: string
          stack?: string | null
          tags?: string[] | null
          type?: string
          url?: string | null
          user_agent?: string | null
        }
        Relationships: []
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
            foreignKeyName: "eugene_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          consecutive_failures: number | null
          created_at: string
          events_count: number | null
          external_property_id: string
          id: string
          last_failure_at: string | null
          last_sync_at: string | null
          organization_id: string | null
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
          consecutive_failures?: number | null
          created_at?: string
          events_count?: number | null
          external_property_id: string
          id?: string
          last_failure_at?: string | null
          last_sync_at?: string | null
          organization_id?: string | null
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
          consecutive_failures?: number | null
          created_at?: string
          events_count?: number | null
          external_property_id?: string
          id?: string
          last_failure_at?: string | null
          last_sync_at?: string | null
          organization_id?: string | null
          platform?: string
          property_id?: string
          sync_enabled?: boolean
          sync_errors?: string[] | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendars_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_calendars_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_calendars_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "guest_communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "guest_inbox_threads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "guest_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "guest_support_chats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_support_chats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "guest_support_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_support_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          phone?: string | null
          reservation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_check_logs: {
        Row: {
          checks: Json | null
          created_at: string
          id: string
          status: string
          uptime: number | null
        }
        Insert: {
          checks?: Json | null
          created_at?: string
          id?: string
          status: string
          uptime?: number | null
        }
        Update: {
          checks?: Json | null
          created_at?: string
          id?: string
          status?: string
          uptime?: number | null
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          article_type: string
          category_id: string | null
          content: string
          created_at: string
          id: string
          is_published: boolean
          sort_order: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          article_type?: string
          category_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          sort_order?: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          article_type?: string
          category_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          sort_order?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      help_faqs: {
        Row: {
          answer: string
          audience: string
          category_id: string | null
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          audience?: string
          category_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          audience?: string
          category_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_faqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
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
          {
            foreignKeyName: "home_amenities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
      incident_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          incident_id: string
          message: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          incident_id: string
          message: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          incident_id?: string
          message?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_updates_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "system_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_validation_attempts: {
        Row: {
          attempted_at: string
          id: string
          ip_identifier: string
          token_hash: string
          was_successful: boolean
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_identifier: string
          token_hash: string
          was_successful?: boolean
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_identifier?: string
          token_hash?: string
          was_successful?: boolean
        }
        Relationships: []
      }
      length_of_stay_discounts: {
        Row: {
          created_at: string | null
          discount_percentage: number
          id: string
          is_active: boolean | null
          min_nights: number
          organization_id: string | null
          property_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_percentage: number
          id?: string
          is_active?: boolean | null
          min_nights: number
          organization_id?: string | null
          property_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean | null
          min_nights?: number
          organization_id?: string | null
          property_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "length_of_stay_discounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "length_of_stay_discounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "length_of_stay_discounts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lifestyle_gallery: {
        Row: {
          activity_type: string | null
          category: string
          created_at: string
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
          {
            foreignKeyName: "lifestyle_gallery_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_checklist_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_checklist_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "maintenance_checklist_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "messaging_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "newsletter_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          recipient_count?: number | null
          sent_at?: string | null
          subject?: string
          total_bounces?: number | null
          total_clicks?: number | null
          total_opens?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_click_tracking: {
        Row: {
          campaign_id: string | null
          click_count: number | null
          clicked_at: string | null
          created_at: string
          id: string
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "newsletter_click_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_click_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          phone?: string | null
          preferences?: Json | null
          sms_opt_in?: boolean | null
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscribers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_subscribers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          team_role: Database["public"]["Enums"]["team_role"] | null
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: string
          team_role?: Database["public"]["Enums"]["team_role"] | null
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          team_role?: Database["public"]["Enums"]["team_role"] | null
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
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "organization_onboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_secrets: {
        Row: {
          created_at: string
          encrypted_value: string
          id: string
          organization_id: string
          secret_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          encrypted_value: string
          id?: string
          organization_id: string
          secret_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          encrypted_value?: string
          id?: string
          organization_id?: string
          secret_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_secrets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_secrets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_templates: {
        Row: {
          created_at: string | null
          default_settings: Json | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          preview_image_url: string | null
          slug: string
          template_type: string
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_settings?: Json | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_image_url?: string | null
          slug: string
          template_type: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_settings?: Json | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_image_url?: string | null
          slug?: string
          template_type?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          domain_dns_records: Json | null
          domain_last_checked_at: string | null
          domain_verification_status: string | null
          domain_verified_at: string | null
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
          domain_dns_records?: Json | null
          domain_last_checked_at?: string | null
          domain_verification_status?: string | null
          domain_verified_at?: string | null
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
          domain_dns_records?: Json | null
          domain_last_checked_at?: string | null
          domain_verification_status?: string | null
          domain_verified_at?: string | null
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
      page_views: {
        Row: {
          content_id: string | null
          content_type: string | null
          created_at: string
          id: string
          organization_id: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_views_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          nav_order: number | null
          organization_id: string
          show_in_nav: boolean
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
          nav_order?: number | null
          organization_id: string
          show_in_nav?: boolean
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
          nav_order?: number | null
          organization_id?: string
          show_in_nav?: boolean
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
          {
            foreignKeyName: "pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          performed_by: string | null
          target_id: string
          target_name: string | null
          target_type: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          target_id: string
          target_name?: string | null
          target_type: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
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
          {
            foreignKeyName: "place_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "places_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admin_audit_logs: {
        Row: {
          action_type: string
          admin_id: string | null
          admin_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          session_id: string | null
          target_id: string | null
          target_name: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "platform_admins"
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
          last_login_at: string | null
          login_count: number | null
          permissions: Json | null
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          login_count?: number | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          login_count?: number | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      platform_blog_posts: {
        Row: {
          author: string
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          excerpt: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          excerpt: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_metrics: {
        Row: {
          dimensions: Json | null
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          dimensions?: Json | null
          id?: string
          metric_name: string
          metric_type?: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          dimensions?: Json | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string
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
            foreignKeyName: "pricelabs_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          priority?: number | null
          property_id?: string
          rule_name?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          marketing_opt_in: boolean | null
          onboarding_completed: boolean
          organization_id: string | null
          permissions: Json | null
          phone: string | null
          privacy_accepted_at: string | null
          role: string
          status: string
          terms_accepted_at: string | null
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
          marketing_opt_in?: boolean | null
          onboarding_completed?: boolean
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          privacy_accepted_at?: string | null
          role?: string
          status?: string
          terms_accepted_at?: string | null
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
          marketing_opt_in?: boolean | null
          onboarding_completed?: boolean
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          privacy_accepted_at?: string | null
          role?: string
          status?: string
          terms_accepted_at?: string | null
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
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          organization_id: string | null
          priority: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code_usage: {
        Row: {
          booking_total: number
          discount_amount: number
          guest_email: string
          id: string
          organization_id: string | null
          promo_code_id: string
          reservation_id: string | null
          used_at: string | null
        }
        Insert: {
          booking_total: number
          discount_amount: number
          guest_email: string
          id?: string
          organization_id?: string | null
          promo_code_id: string
          reservation_id?: string | null
          used_at?: string | null
        }
        Update: {
          booking_total?: number
          discount_amount?: number
          guest_email?: string
          id?: string
          organization_id?: string | null
          promo_code_id?: string
          reservation_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promotional_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_codes: {
        Row: {
          applies_to: string | null
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_amount: number
          discount_type: string
          first_time_only: boolean | null
          id: string
          is_active: boolean | null
          max_discount_cap: number | null
          max_uses: number | null
          min_booking_value: number | null
          min_nights: number | null
          organization_id: string | null
          per_guest_limit: number | null
          property_id: string | null
          updated_at: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applies_to?: string | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_amount: number
          discount_type: string
          first_time_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_cap?: number | null
          max_uses?: number | null
          min_booking_value?: number | null
          min_nights?: number | null
          organization_id?: string | null
          per_guest_limit?: number | null
          property_id?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applies_to?: string | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_amount?: number
          discount_type?: string
          first_time_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_cap?: number | null
          max_uses?: number | null
          min_booking_value?: number | null
          min_nights?: number | null
          organization_id?: string | null
          per_guest_limit?: number | null
          property_id?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_codes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          airbnb_listing_url: string | null
          amenities: string | null
          bathrooms: number
          bedrooms: number
          calendar_export_token: string | null
          city: string | null
          cleaning_fee: number | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string
          display_order: number | null
          extra_guest_fee: number | null
          extra_guest_threshold: number | null
          featured_photos: string[] | null
          id: string
          image_url: string | null
          images: string[] | null
          latitude: number | null
          location: string
          longitude: number | null
          max_guests: number
          organization_id: string | null
          pet_fee: number | null
          pet_fee_type: string | null
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
          calendar_export_token?: string | null
          city?: string | null
          cleaning_fee?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number | null
          extra_guest_fee?: number | null
          extra_guest_threshold?: number | null
          featured_photos?: string[] | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          latitude?: number | null
          location: string
          longitude?: number | null
          max_guests: number
          organization_id?: string | null
          pet_fee?: number | null
          pet_fee_type?: string | null
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
          calendar_export_token?: string | null
          city?: string | null
          cleaning_fee?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number | null
          extra_guest_fee?: number | null
          extra_guest_threshold?: number | null
          featured_photos?: string[] | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_guests?: number
          organization_id?: string | null
          pet_fee?: number | null
          pet_fee_type?: string | null
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
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          personal_message?: string | null
          property_id?: string
          updated_at?: string
          wifi_name?: string | null
          wifi_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_access_details_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_access_details_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "property_checklist_item_completions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_checklist_item_completions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          period?: string
          property_id?: string
          started_at?: string | null
          status?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_checklist_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_checklist_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "property_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_fees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_fees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
          property_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          property_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          property_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_guidebooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_guidebooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
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
          payment_notes: string | null
          payment_status: string | null
          property_id: string
          refund_amount: number | null
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
          payment_notes?: string | null
          payment_status?: string | null
          property_id: string
          refund_amount?: number | null
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
          payment_notes?: string | null
          payment_status?: string | null
          property_id?: string
          refund_amount?: number | null
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
            foreignKeyName: "property_reservations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string
          stripe_account_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_stripe_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_stripe_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
          property_id: string
          tax_rate_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          property_id: string
          tax_rate_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          property_id?: string
          tax_rate_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_tax_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tax_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
      push_notification_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_notification_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
            foreignKeyName: "reservations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          reservation_id?: string
          rule_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "seam_access_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seam_access_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string | null
          seam_device_id?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seam_devices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seam_devices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          workspace_id?: string
          workspace_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "seam_workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seam_workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setup_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setup_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key: string
          organization_id: string | null
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key: string
          organization_id?: string | null
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
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
          {
            foreignKeyName: "site_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          stripe_annual_price_id: string | null
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
          stripe_annual_price_id?: string | null
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
          stripe_annual_price_id?: string | null
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_responses: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string
          id: string
          is_staff_response: boolean | null
          organization_id: string | null
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string
          id?: string
          is_staff_response?: boolean | null
          organization_id?: string | null
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string
          id?: string
          is_staff_response?: boolean | null
          organization_id?: string | null
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          archived_at: string | null
          assigned_to: string | null
          attachments: string[] | null
          category: string
          created_at: string
          description: string
          email: string
          id: string
          is_archived: boolean | null
          name: string | null
          organization_id: string | null
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          category: string
          created_at?: string
          description: string
          email: string
          id?: string
          is_archived?: boolean | null
          name?: string | null
          organization_id?: string | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          category?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          is_archived?: boolean | null
          name?: string | null
          organization_id?: string | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string
          data_synced: Json | null
          error_details: Json | null
          execution_time_ms: number | null
          id: string
          message: string | null
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          platform?: string
          property_id?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string
          sync_status?: string
          sync_type?: string
          total_reviews_found?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_metadata_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      system_incidents: {
        Row: {
          affected_services: string[] | null
          created_at: string
          description: string
          id: string
          resolved_at: string | null
          severity: string
          started_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_services?: string[] | null
          created_at?: string
          description: string
          id?: string
          resolved_at?: string | null
          severity: string
          started_at?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_services?: string[] | null
          created_at?: string
          description?: string
          id?: string
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      system_status: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_checked_at: string | null
          service_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_checked_at?: string | null
          service_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_checked_at?: string | null
          service_name?: string
          status?: string
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
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          organization_id: string | null
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
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
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
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          project_id?: string | null
          property_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          applies_to: string
          created_at: string | null
          effective_from: string
          effective_to: string | null
          flat_amount: number | null
          id: string
          is_active: boolean | null
          jurisdiction: string
          jurisdiction_type: string
          organization_id: string | null
          tax_name: string
          tax_rate: number
          tax_type: string
          updated_at: string | null
        }
        Insert: {
          applies_to?: string
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          flat_amount?: number | null
          id?: string
          is_active?: boolean | null
          jurisdiction: string
          jurisdiction_type: string
          organization_id?: string | null
          tax_name: string
          tax_rate: number
          tax_type?: string
          updated_at?: string | null
        }
        Update: {
          applies_to?: string
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          flat_amount?: number | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string
          jurisdiction_type?: string
          organization_id?: string | null
          tax_name?: string
          tax_rate?: number
          tax_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      team_activity_log: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      team_permissions: {
        Row: {
          created_at: string | null
          id: string
          is_allowed: boolean | null
          permission_key: string
          team_role: Database["public"]["Enums"]["team_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean | null
          permission_key: string
          team_role: Database["public"]["Enums"]["team_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean | null
          permission_key?: string
          team_role?: Database["public"]["Enums"]["team_role"]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string | null
          property_name?: string | null
          rating?: number
          review_text?: string
          status?: string | null
          stay_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
          property_id: string | null
          property_name: string
          turno_property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          property_id?: string | null
          property_name: string
          turno_property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          property_id?: string | null
          property_name?: string
          turno_property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turno_property_mapping_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turno_property_mapping_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
      tv_device_pairings: {
        Row: {
          created_at: string
          current_reservation_id: string | null
          device_id: string
          device_name: string | null
          display_mode: string
          guest_email: string | null
          id: string
          is_paired: boolean
          last_seen_at: string | null
          organization_id: string
          paired_at: string | null
          pairing_code: string | null
          pairing_code_expires_at: string | null
          property_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_reservation_id?: string | null
          device_id: string
          device_name?: string | null
          display_mode?: string
          guest_email?: string | null
          id?: string
          is_paired?: boolean
          last_seen_at?: string | null
          organization_id: string
          paired_at?: string | null
          pairing_code?: string | null
          pairing_code_expires_at?: string | null
          property_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_reservation_id?: string | null
          device_id?: string
          device_name?: string | null
          display_mode?: string
          guest_email?: string | null
          id?: string
          is_paired?: boolean
          last_seen_at?: string | null
          organization_id?: string
          paired_at?: string | null
          pairing_code?: string | null
          pairing_code_expires_at?: string | null
          property_id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tv_device_pairings_current_reservation_id_fkey"
            columns: ["current_reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_device_pairings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_device_pairings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_device_pairings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tv_pairing_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          device_pairing_id: string | null
          guest_email: string | null
          id: string
          ip_address: string | null
          organization_id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          device_pairing_id?: string | null
          guest_email?: string | null
          id?: string
          ip_address?: string | null
          organization_id: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          device_pairing_id?: string | null
          guest_email?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tv_pairing_audit_logs_device_pairing_id_fkey"
            columns: ["device_pairing_id"]
            isOneToOne: false
            referencedRelation: "tv_device_pairings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_pairing_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_pairing_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_pairing_audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          performed_by: string | null
          target_user_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          admin_notes: string | null
          archived_at: string | null
          created_at: string
          description: string
          feedback_type: string
          id: string
          is_archived: boolean | null
          organization_id: string | null
          priority: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
          votes: number | null
        }
        Insert: {
          admin_notes?: string | null
          archived_at?: string | null
          created_at?: string
          description: string
          feedback_type: string
          id?: string
          is_archived?: boolean | null
          organization_id?: string | null
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
          votes?: number | null
        }
        Update: {
          admin_notes?: string | null
          archived_at?: string | null
          created_at?: string
          description?: string
          feedback_type?: string
          id?: string
          is_archived?: boolean | null
          organization_id?: string | null
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          cancelled_at: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invitation_token: string
          invited_by: string | null
          inviter_name: string | null
          organization_id: string | null
          organization_name: string | null
          resend_count: number | null
          resent_at: string | null
          role: string
          status: string | null
          team_role: Database["public"]["Enums"]["team_role"] | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invitation_token: string
          invited_by?: string | null
          inviter_name?: string | null
          organization_id?: string | null
          organization_name?: string | null
          resend_count?: number | null
          resent_at?: string | null
          role?: string
          status?: string | null
          team_role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invitation_token?: string
          invited_by?: string | null
          inviter_name?: string | null
          organization_id?: string | null
          organization_name?: string | null
          resend_count?: number | null
          resent_at?: string | null
          role?: string
          status?: string | null
          team_role?: Database["public"]["Enums"]["team_role"] | null
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
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
          token: string
          used_at: string | null
          work_order_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string | null
          token: string
          used_at?: string | null
          work_order_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string | null
          token?: string
          used_at?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_acknowledgement_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_acknowledgement_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "work_order_acknowledgments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          organization_id: string | null
          status: string
          work_order_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          status: string
          work_order_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          status?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_status_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_status_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
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
          assigned_user_id: string | null
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
          assigned_user_id?: string | null
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
          assigned_user_id?: string | null
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
            foreignKeyName: "work_orders_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "work_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
      organizations_safe: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          domain_dns_records: Json | null
          domain_last_checked_at: string | null
          domain_verification_status: string | null
          domain_verified_at: string | null
          has_openphone_configured: boolean | null
          has_openweather_configured: boolean | null
          has_pricelabs_configured: boolean | null
          has_resend_configured: boolean | null
          has_seam_configured: boolean | null
          has_stripe_configured: boolean | null
          has_stripe_publishable_configured: boolean | null
          has_stripe_webhook_configured: boolean | null
          has_turno_configured: boolean | null
          id: string | null
          is_active: boolean | null
          is_template: boolean | null
          logo_url: string | null
          name: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          openphone_phone_number: string | null
          slug: string | null
          stripe_account_id: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          template_type: string | null
          trial_ends_at: string | null
          turno_partner_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          domain_dns_records?: Json | null
          domain_last_checked_at?: string | null
          domain_verification_status?: string | null
          domain_verified_at?: string | null
          has_openphone_configured?: never
          has_openweather_configured?: never
          has_pricelabs_configured?: never
          has_resend_configured?: never
          has_seam_configured?: never
          has_stripe_configured?: never
          has_stripe_publishable_configured?: never
          has_stripe_webhook_configured?: never
          has_turno_configured?: never
          id?: string | null
          is_active?: boolean | null
          is_template?: boolean | null
          logo_url?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          openphone_phone_number?: string | null
          slug?: string | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          template_type?: string | null
          trial_ends_at?: string | null
          turno_partner_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          domain_dns_records?: Json | null
          domain_last_checked_at?: string | null
          domain_verification_status?: string | null
          domain_verified_at?: string | null
          has_openphone_configured?: never
          has_openweather_configured?: never
          has_pricelabs_configured?: never
          has_resend_configured?: never
          has_seam_configured?: never
          has_stripe_configured?: never
          has_stripe_publishable_configured?: never
          has_stripe_webhook_configured?: never
          has_turno_configured?: never
          id?: string | null
          is_active?: boolean | null
          is_template?: boolean | null
          logo_url?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          openphone_phone_number?: string | null
          slug?: string | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          template_type?: string | null
          trial_ends_at?: string | null
          turno_partner_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
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
      check_account_lockout: { Args: { p_email: string }; Returns: Json }
      check_invitation_rate_limit: {
        Args: {
          p_ip_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
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
      cleanup_old_logs: { Args: never; Returns: undefined }
      cleanup_old_webhook_events: { Args: never; Returns: undefined }
      clear_failed_logins: { Args: { p_email: string }; Returns: undefined }
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
      current_user_is_admin: { Args: never; Returns: boolean }
      generate_work_order_number: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
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
      get_organization_safe: {
        Args: { _org_id: string }
        Returns: {
          custom_domain: string
          has_seam_configured: boolean
          has_stripe_configured: boolean
          id: string
          is_active: boolean
          logo_url: string
          name: string
          slug: string
          template_type: string
          website: string
        }[]
      }
      get_organization_secret: {
        Args: { _org_id: string; _secret_name: string }
        Returns: string
      }
      get_organizations_for_user: {
        Args: never
        Returns: {
          created_at: string
          custom_domain: string
          domain_verification_status: string
          domain_verified_at: string
          has_openphone_configured: boolean
          has_pricelabs_configured: boolean
          has_resend_configured: boolean
          has_seam_configured: boolean
          has_stripe_configured: boolean
          id: string
          is_active: boolean
          is_template: boolean
          logo_url: string
          name: string
          slug: string
          template_type: string
          updated_at: string
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
      get_public_pricing: {
        Args: {
          p_end_date: string
          p_property_id: string
          p_start_date: string
        }
        Returns: {
          checkin_allowed: boolean
          checkout_allowed: boolean
          currency: string
          date: string
          final_price: number
          min_stay: number
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
      get_team_role: {
        Args: { _organization_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["team_role"]
      }
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_platform_role: {
        Args: {
          _role: Database["public"]["Enums"]["platform_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_team_permission: {
        Args: {
          _organization_id: string
          _permission_key: string
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_platform_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_slug_available: { Args: { _slug: string }; Returns: boolean }
      log_invitation_attempt: {
        Args: {
          p_ip_identifier: string
          p_token_hash: string
          p_was_successful: boolean
        }
        Returns: undefined
      }
      log_platform_admin_action: {
        Args: {
          p_action_type: string
          p_details?: Json
          p_target_id?: string
          p_target_name?: string
          p_target_type?: string
        }
        Returns: string
      }
      record_promo_code_usage: {
        Args: {
          p_booking_total: number
          p_discount_amount: number
          p_guest_email: string
          p_organization_id: string
          p_promo_code_id: string
          p_reservation_id: string
        }
        Returns: undefined
      }
      refresh_office_space_availability: {
        Args: { p_office_space_id: string }
        Returns: undefined
      }
      regenerate_calendar_export_token: {
        Args: { p_property_id: string }
        Returns: string
      }
      track_failed_login: { Args: { p_email: string }; Returns: Json }
      turno_sync_properties: { Args: never; Returns: undefined }
      update_domain_verification_status: {
        Args: { _dns_records?: Json; _org_id: string; _status: string }
        Returns: undefined
      }
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
      validate_promo_code: {
        Args: {
          p_booking_total: number
          p_code: string
          p_guest_email: string
          p_nights: number
          p_organization_id: string
          p_property_id: string
        }
        Returns: {
          calculated_discount: number
          discount_amount: number
          discount_type: string
          error_message: string
          is_valid: boolean
          promo_id: string
        }[]
      }
      validate_tenant_access: {
        Args: { _property_id: string }
        Returns: boolean
      }
    }
    Enums: {
      platform_role: "super_admin" | "support" | "billing"
      team_role: "owner" | "manager" | "staff" | "view_only"
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
      team_role: ["owner", "manager", "staff", "view_only"],
    },
  },
} as const
