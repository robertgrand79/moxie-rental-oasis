export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      blog_posts: {
        Row: {
          author: string
          content: string
          created_at: string
          created_by: string
          excerpt: string
          id: string
          image_url: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          created_by: string
          excerpt: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          created_by?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      eugene_events: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
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
          created_by: string
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
          created_by?: string
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
          ticket_url?: string | null
          time_end?: string | null
          time_start?: string | null
          title?: string
          updated_at?: string
          website_url?: string | null
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
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          blog_post_id: string | null
          content: string
          created_at: string
          id: string
          recipient_count: number | null
          sent_at: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          blog_post_id?: string | null
          content: string
          created_at?: string
          id?: string
          recipient_count?: number | null
          sent_at?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          blog_post_id?: string | null
          content?: string
          created_at?: string
          id?: string
          recipient_count?: number | null
          sent_at?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          preferences: Json | null
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          preferences?: Json | null
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          preferences?: Json | null
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string
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
          created_by: string
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
          created_by?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
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
          updated_at?: string
          walking_time?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
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
          created_at: string
          created_by: string
          description: string
          hospitable_booking_url: string | null
          id: string
          image_url: string | null
          images: string[] | null
          location: string
          max_guests: number
          price_per_night: number
          title: string
          updated_at: string
        }
        Insert: {
          amenities?: string | null
          bathrooms: number
          bedrooms: number
          created_at?: string
          created_by: string
          description: string
          hospitable_booking_url?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          location: string
          max_guests: number
          price_per_night: number
          title: string
          updated_at?: string
        }
        Update: {
          amenities?: string | null
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          created_by?: string
          description?: string
          hospitable_booking_url?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          location?: string
          max_guests?: number
          price_per_night?: number
          title?: string
          updated_at?: string
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
      task_comments: {
        Row: {
          comment: string
          created_at: string
          created_by: string
          id: string
          task_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          created_by: string
          id?: string
          task_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          created_by?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
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
      testimonials: {
        Row: {
          created_at: string
          created_by: string
          display_order: number | null
          guest_avatar_url: string | null
          guest_location: string | null
          guest_name: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          property_name: string | null
          rating: number
          review_text: string
          stay_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          display_order?: number | null
          guest_avatar_url?: string | null
          guest_location?: string | null
          guest_name: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          property_name?: string | null
          rating?: number
          review_text: string
          stay_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          display_order?: number | null
          guest_avatar_url?: string | null
          guest_location?: string | null
          guest_name?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          property_name?: string | null
          rating?: number
          review_text?: string
          stay_date?: string | null
          updated_at?: string
        }
        Relationships: []
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
          special_instructions: string | null
          status: string
          task_id: string | null
          title: string
          updated_at: string
          work_order_number: string
        }
        Insert: {
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
          special_instructions?: string | null
          status?: string
          task_id?: string | null
          title: string
          updated_at?: string
          work_order_number: string
        }
        Update: {
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
          special_instructions?: string | null
          status?: string
          task_id?: string | null
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
            foreignKeyName: "work_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      [_ in never]: never
    }
    Functions: {
      generate_work_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
