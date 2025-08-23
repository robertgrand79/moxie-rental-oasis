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
    PostgrestVersion: "12.2.3 (519615d)"
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
        Relationships: []
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
      contractors: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          created_by: string
          email: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      device_configurations: {
        Row: {
          configuration_data: Json | null
          created_at: string | null
          device_id: string
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_locked: boolean | null
          last_active: string | null
          last_health_check: string | null
          property_id: string
          registered_at: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          configuration_data?: Json | null
          created_at?: string | null
          device_id: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_locked?: boolean | null
          last_active?: string | null
          last_health_check?: string | null
          property_id: string
          registered_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          configuration_data?: Json | null
          created_at?: string | null
          device_id?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_locked?: boolean | null
          last_active?: string | null
          last_health_check?: string | null
          property_id?: string
          registered_at?: string | null
          status?: string | null
          updated_at?: string | null
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
        Relationships: []
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
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          created_at: string
          id: string
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
          created_at?: string
          id?: string
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
          created_at?: string
          id?: string
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
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          meta_description: string | null
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
      points_of_interest: {
        Row: {
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
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          price_level: number | null
          rating: number | null
          status: string
          updated_at: string
          walking_time: number | null
          website_url: string | null
        }
        Insert: {
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
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          price_level?: number | null
          rating?: number | null
          status?: string
          updated_at?: string
          walking_time?: number | null
          website_url?: string | null
        }
        Update: {
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
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          price_level?: number | null
          rating?: number | null
          status?: string
          updated_at?: string
          walking_time?: number | null
          website_url?: string | null
        }
        Relationships: []
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
          permissions?: Json | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
          amenities: string | null
          bathrooms: number
          bedrooms: number
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string
          display_order: number | null
          featured_photos: string[] | null
          hospitable_booking_url: string | null
          hospitable_property_id: string | null
          id: string
          image_url: string | null
          images: string[] | null
          location: string
          max_guests: number
          price_per_night: number | null
          title: string
          updated_at: string
        }
        Insert: {
          amenities?: string | null
          bathrooms: number
          bedrooms: number
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description: string
          display_order?: number | null
          featured_photos?: string[] | null
          hospitable_booking_url?: string | null
          hospitable_property_id?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          location: string
          max_guests: number
          price_per_night?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          amenities?: string | null
          bathrooms?: number
          bedrooms?: number
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string
          display_order?: number | null
          featured_photos?: string[] | null
          hospitable_booking_url?: string | null
          hospitable_property_id?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          location?: string
          max_guests?: number
          price_per_night?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "property_access_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          check_in_date: string
          check_out_date: string
          confirmation_code: string
          created_at: string
          created_by: string
          id: string
          property_id: string
          special_instructions: string | null
          status: string
          total_guests: number
          updated_at: string
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          confirmation_code: string
          created_at?: string
          created_by: string
          id?: string
          property_id: string
          special_instructions?: string | null
          status?: string
          total_guests?: number
          updated_at?: string
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          confirmation_code?: string
          created_at?: string
          created_by?: string
          id?: string
          property_id?: string
          special_instructions?: string | null
          status?: string
          total_guests?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
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
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
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
          {
            foreignKeyName: "tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          booking_platform: string | null
          content: string | null
          created_at: string
          created_by: string
          display_order: number | null
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
          created_by: string
          display_order?: number | null
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
          created_by?: string
          display_order?: number | null
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
          {
            foreignKeyName: "turno_property_mapping_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
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
          role?: string
          updated_at?: string
        }
        Relationships: []
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
          completed_at: string | null
          completion_photos: string[] | null
          contractor_id: string | null
          created_at: string
          created_by: string
          description: string
          estimated_completion_date: string | null
          estimated_cost: number | null
          id: string
          invoice_attachments: string[] | null
          priority: string
          property_id: string | null
          requires_permits: boolean | null
          scope_of_work: string | null
          sent_at: string | null
          source: string
          special_instructions: string | null
          status: string
          task_id: string | null
          title: string
          turno_last_modified: string | null
          turno_property_id: string | null
          updated_at: string
          work_order_number: string
        }
        Insert: {
          access_code?: string | null
          acknowledged_at?: string | null
          actual_completion_date?: string | null
          actual_cost?: number | null
          attachments?: string[] | null
          completed_at?: string | null
          completion_photos?: string[] | null
          contractor_id?: string | null
          created_at?: string
          created_by: string
          description: string
          estimated_completion_date?: string | null
          estimated_cost?: number | null
          id?: string
          invoice_attachments?: string[] | null
          priority?: string
          property_id?: string | null
          requires_permits?: boolean | null
          scope_of_work?: string | null
          sent_at?: string | null
          source?: string
          special_instructions?: string | null
          status?: string
          task_id?: string | null
          title: string
          turno_last_modified?: string | null
          turno_property_id?: string | null
          updated_at?: string
          work_order_number: string
        }
        Update: {
          access_code?: string | null
          acknowledged_at?: string | null
          actual_completion_date?: string | null
          actual_cost?: number | null
          attachments?: string[] | null
          completed_at?: string | null
          completion_photos?: string[] | null
          contractor_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          estimated_completion_date?: string | null
          estimated_cost?: number | null
          id?: string
          invoice_attachments?: string[] | null
          priority?: string
          property_id?: string | null
          requires_permits?: boolean | null
          scope_of_work?: string | null
          sent_at?: string | null
          source?: string
          special_instructions?: string | null
          status?: string
          task_id?: string | null
          title?: string
          turno_last_modified?: string | null
          turno_property_id?: string | null
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
            foreignKeyName: "work_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      property_listings: {
        Row: {
          amenities: string | null
          bathrooms: number | null
          bedrooms: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          featured_photos: string[] | null
          hospitable_booking_url: string | null
          hospitable_property_id: string | null
          id: string | null
          image_url: string | null
          images: string[] | null
          location: string | null
          max_guests: number | null
          price_per_night: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          featured_photos?: string[] | null
          hospitable_booking_url?: string | null
          hospitable_property_id?: string | null
          id?: string | null
          image_url?: string | null
          images?: string[] | null
          location?: string | null
          max_guests?: number | null
          price_per_night?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          featured_photos?: string[] | null
          hospitable_booking_url?: string | null
          hospitable_property_id?: string | null
          id?: string | null
          image_url?: string | null
          images?: string[] | null
          location?: string | null
          max_guests?: number | null
          price_per_night?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_old_community_updates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      can_manage_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
      generate_work_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      refresh_office_space_availability: {
        Args: { p_office_space_id: string }
        Returns: undefined
      }
      turno_sync_properties: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_permission: {
        Args: { permission_key: string; user_id: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
