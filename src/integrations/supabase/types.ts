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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_requests: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          request_body: Json | null
          response_body: Json | null
          response_status: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          request_body?: Json | null
          response_body?: Json | null
          response_status?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          request_body?: Json | null
          response_body?: Json | null
          response_status?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      api_settings: {
        Row: {
          allowed_origins: Json | null
          api_key: string
          api_secret: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          rate_limit: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_origins?: Json | null
          api_key: string
          api_secret: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          rate_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_origins?: Json | null
          api_key?: string
          api_secret?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          rate_limit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount_paid: number | null
          booking_number: number
          check_in: string
          check_out: string
          created_at: string | null
          discount_amount: number | null
          guest_name: string | null
          guests: number
          hotel_confirmation_number: string | null
          hotel_id: string
          id: string
          manual_total: number | null
          notes: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          rooms: number
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          booking_number?: number
          check_in: string
          check_out: string
          created_at?: string | null
          discount_amount?: number | null
          guest_name?: string | null
          guests?: number
          hotel_confirmation_number?: string | null
          hotel_id: string
          id?: string
          manual_total?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          rooms?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          booking_number?: number
          check_in?: string
          check_out?: string
          created_at?: string | null
          discount_amount?: number | null
          guest_name?: string | null
          guests?: number
          hotel_confirmation_number?: string | null
          hotel_id?: string
          id?: string
          manual_total?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          rooms?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name_ar: string
          name_en: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name_ar: string
          name_en: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          admin_response: string | null
          booking_id: string | null
          created_at: string | null
          description: string
          id: string
          status: Database["public"]["Enums"]["complaint_status"] | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          booking_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          status?: Database["public"]["Enums"]["complaint_status"] | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          booking_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["complaint_status"] | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_attendance: {
        Row: {
          attendance_date: string
          check_in: string
          check_out: string | null
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          attendance_date?: string
          check_in: string
          check_out?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          attendance_date?: string
          check_in?: string
          check_out?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_salaries: {
        Row: {
          bonus: number | null
          created_at: string | null
          deductions: number | null
          employee_id: string
          id: string
          monthly_salary: number
          notes: string | null
          payment_date: string
          payment_status: string | null
          updated_at: string | null
        }
        Insert: {
          bonus?: number | null
          created_at?: string | null
          deductions?: number | null
          employee_id: string
          id?: string
          monthly_salary?: number
          notes?: string | null
          payment_date: string
          payment_status?: string | null
          updated_at?: string | null
        }
        Update: {
          bonus?: number | null
          created_at?: string | null
          deductions?: number | null
          employee_id?: string
          id?: string
          monthly_salary?: number
          notes?: string | null
          payment_date?: string
          payment_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_responsible_persons: {
        Row: {
          created_at: string | null
          employee_id: string
          hotel_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          hotel_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          hotel_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_responsible_persons_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_seasonal_pricing: {
        Row: {
          created_at: string | null
          end_date: string
          hotel_id: string
          id: string
          is_available: boolean | null
          price_per_night: number
          season_name_ar: string
          season_name_en: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          hotel_id: string
          id?: string
          is_available?: boolean | null
          price_per_night: number
          season_name_ar: string
          season_name_en: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          hotel_id?: string
          id?: string
          is_available?: boolean | null
          price_per_night?: number
          season_name_ar?: string
          season_name_en?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_seasonal_pricing_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          active: boolean | null
          city_id: string
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          extra_guest_price: number
          id: string
          images: Json | null
          location: string | null
          location_url: string | null
          max_guests_per_room: number
          meal_plans: Json | null
          name_ar: string
          name_en: string
          price_per_night: number
          rating: number | null
          responsible_person_id: string | null
          room_type: Database["public"]["Enums"]["room_type"] | null
          tax_percentage: number | null
          total_rooms: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          city_id: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          extra_guest_price?: number
          id?: string
          images?: Json | null
          location?: string | null
          location_url?: string | null
          max_guests_per_room?: number
          meal_plans?: Json | null
          name_ar: string
          name_en: string
          price_per_night: number
          rating?: number | null
          responsible_person_id?: string | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          tax_percentage?: number | null
          total_rooms?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          city_id?: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          extra_guest_price?: number
          id?: string
          images?: Json | null
          location?: string | null
          location_url?: string | null
          max_guests_per_room?: number
          meal_plans?: Json | null
          name_ar?: string
          name_en?: string
          price_per_night?: number
          rating?: number | null
          responsible_person_id?: string | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          tax_percentage?: number | null
          total_rooms?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_settings: {
        Row: {
          bank_account_number: string | null
          bank_location: string | null
          bank_name: string | null
          cancellation_policy_ar: string | null
          cancellation_policy_en: string | null
          company_description_ar: string | null
          company_description_en: string | null
          company_logo_url: string | null
          contact_numbers: Json | null
          created_at: string | null
          iban: string | null
          id: string
          responsible_persons: Json | null
          terms_ar: string | null
          terms_en: string | null
          updated_at: string | null
        }
        Insert: {
          bank_account_number?: string | null
          bank_location?: string | null
          bank_name?: string | null
          cancellation_policy_ar?: string | null
          cancellation_policy_en?: string | null
          company_description_ar?: string | null
          company_description_en?: string | null
          company_logo_url?: string | null
          contact_numbers?: Json | null
          created_at?: string | null
          iban?: string | null
          id?: string
          responsible_persons?: Json | null
          terms_ar?: string | null
          terms_en?: string | null
          updated_at?: string | null
        }
        Update: {
          bank_account_number?: string | null
          bank_location?: string | null
          bank_name?: string | null
          cancellation_policy_ar?: string | null
          cancellation_policy_en?: string | null
          company_description_ar?: string | null
          company_description_en?: string | null
          company_logo_url?: string | null
          contact_numbers?: Json | null
          created_at?: string | null
          iban?: string | null
          id?: string
          responsible_persons?: Json | null
          terms_ar?: string | null
          terms_en?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      room_availability: {
        Row: {
          booking_id: string
          check_in: string
          check_out: string
          created_at: string | null
          hotel_id: string
          id: string
          rooms_booked: number
        }
        Insert: {
          booking_id: string
          check_in: string
          check_out: string
          created_at?: string | null
          hotel_id: string
          id?: string
          rooms_booked?: number
        }
        Update: {
          booking_id?: string
          check_in?: string
          check_out?: string
          created_at?: string | null
          hotel_id?: string
          id?: string
          rooms_booked?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_availability_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_availability_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          email: string | null
          facebook_url: string | null
          hotel_room_color: string | null
          id: string
          instagram_url: string | null
          owner_room_color: string | null
          phone: string | null
          tax_percentage: number
          twitter_url: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          hotel_room_color?: string | null
          id?: string
          instagram_url?: string | null
          owner_room_color?: string | null
          phone?: string | null
          tax_percentage?: number
          twitter_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          hotel_room_color?: string | null
          id?: string
          instagram_url?: string | null
          owner_room_color?: string | null
          phone?: string | null
          tax_percentage?: number
          twitter_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_room_availability: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_hotel_id: string
          p_rooms_needed: number
        }
        Returns: boolean
      }
      get_hotel_contacts: {
        Args: { p_hotel_id: string }
        Returns: {
          contact_person: string
          contact_phone: string
        }[]
      }
      get_hotel_price_for_date: {
        Args: { p_check_in_date: string; p_hotel_id: string }
        Returns: number
      }
      get_public_hotel: {
        Args: { p_hotel_id: string }
        Returns: {
          active: boolean
          city_id: string
          city_name_ar: string
          city_name_en: string
          created_at: string
          description_ar: string
          description_en: string
          extra_guest_price: number
          id: string
          images: Json
          location: string
          location_url: string
          max_guests_per_room: number
          name_ar: string
          name_en: string
          price_per_night: number
          rating: number
          room_type: Database["public"]["Enums"]["room_type"]
          tax_percentage: number
          total_rooms: number
          updated_at: string
        }[]
      }
      get_public_hotels: {
        Args: { p_active_only?: boolean; p_city_id?: string }
        Returns: {
          active: boolean
          city_id: string
          city_name_ar: string
          city_name_en: string
          created_at: string
          description_ar: string
          description_en: string
          extra_guest_price: number
          id: string
          images: Json
          location: string
          location_url: string
          max_guests_per_room: number
          name_ar: string
          name_en: string
          price_per_night: number
          rating: number
          room_type: Database["public"]["Enums"]["room_type"]
          tax_percentage: number
          total_rooms: number
          updated_at: string
        }[]
      }
      get_public_site_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          facebook_url: string
          hotel_room_color: string
          instagram_url: string
          owner_room_color: string
          phone: string
          twitter_url: string
          whatsapp_number: string
        }[]
      }
      get_site_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          facebook_url: string
          hotel_room_color: string
          instagram_url: string
          owner_room_color: string
          phone: string
          tax_percentage: number
          twitter_url: string
          whatsapp_number: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "employee" | "customer"
      booking_status: "new" | "pending" | "confirmed" | "cancelled" | "rejected"
      complaint_status: "new" | "pending" | "rejected" | "resolved"
      meal_plan_type:
        | "breakfast_only"
        | "half_board"
        | "full_board"
        | "all_inclusive"
        | "no_meals"
      payment_status: "paid" | "partially_paid" | "unpaid"
      room_type: "hotel_rooms" | "owner_rooms"
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
      app_role: ["admin", "employee", "customer"],
      booking_status: ["new", "pending", "confirmed", "cancelled", "rejected"],
      complaint_status: ["new", "pending", "rejected", "resolved"],
      meal_plan_type: [
        "breakfast_only",
        "half_board",
        "full_board",
        "all_inclusive",
        "no_meals",
      ],
      payment_status: ["paid", "partially_paid", "unpaid"],
      room_type: ["hotel_rooms", "owner_rooms"],
    },
  },
} as const
