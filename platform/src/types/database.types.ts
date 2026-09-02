export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      agency_audit_log: {
        Row: {
          action: string;
          actor_email: string;
          created_at: string | null;
          detail: Json | null;
          hotel_slug: string | null;
          id: string;
          ip_address: unknown;
        };
        Insert: {
          action: string;
          actor_email: string;
          created_at?: string | null;
          detail?: Json | null;
          hotel_slug?: string | null;
          id?: string;
          ip_address?: unknown;
        };
        Update: {
          action?: string;
          actor_email?: string;
          created_at?: string | null;
          detail?: Json | null;
          hotel_slug?: string | null;
          id?: string;
          ip_address?: unknown;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string | null;
          detail: Json | null;
          hotel_id: string | null;
          id: string;
          ip_address: unknown;
          resource: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string | null;
          detail?: Json | null;
          hotel_id?: string | null;
          id?: string;
          ip_address?: unknown;
          resource?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string | null;
          detail?: Json | null;
          hotel_id?: string | null;
          id?: string;
          ip_address?: unknown;
          resource?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_log_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_events: {
        Row: {
          booking_id: string | null;
          booking_value: number | null;
          channel: string | null;
          check_in: string | null;
          check_out: string | null;
          created_at: string;
          fee_amount: number | null;
          fee_percentage: number;
          guest_name: string | null;
          hotel_id: string;
          id: string;
          room_type: string | null;
          status: string;
        };
        Insert: {
          booking_id?: string | null;
          booking_value?: number | null;
          channel?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string;
          fee_amount?: number | null;
          fee_percentage?: number;
          guest_name?: string | null;
          hotel_id: string;
          id?: string;
          room_type?: string | null;
          status?: string;
        };
        Update: {
          booking_id?: string | null;
          booking_value?: number | null;
          channel?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string;
          fee_amount?: number | null;
          fee_percentage?: number;
          guest_name?: string | null;
          hotel_id?: string;
          id?: string;
          room_type?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_events_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings: {
        Row: {
          booking_reference: string | null;
          check_in: string | null;
          check_out: string | null;
          created_at: string | null;
          guest_name: string | null;
          hotel_id: string | null;
          id: string;
          room_type: string | null;
          status: string | null;
          total_amount: number | null;
        };
        Insert: {
          booking_reference?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string | null;
          guest_name?: string | null;
          hotel_id?: string | null;
          id?: string;
          room_type?: string | null;
          status?: string | null;
          total_amount?: number | null;
        };
        Update: {
          booking_reference?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string | null;
          guest_name?: string | null;
          hotel_id?: string | null;
          id?: string;
          room_type?: string | null;
          status?: string | null;
          total_amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      conversations: {
        Row: {
          channel: string | null;
          client_id: string | null;
          content: string;
          created_at: string | null;
          hotel_slug: string | null;
          id: string;
          role: string;
          session_id: string;
        };
        Insert: {
          channel?: string | null;
          client_id?: string | null;
          content: string;
          created_at?: string | null;
          hotel_slug?: string | null;
          id?: string;
          role: string;
          session_id: string;
        };
        Update: {
          channel?: string | null;
          client_id?: string | null;
          content?: string;
          created_at?: string | null;
          hotel_slug?: string | null;
          id?: string;
          role?: string;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      faqs: {
        Row: {
          active: boolean | null;
          answer: string;
          category: string | null;
          created_at: string | null;
          display_order: number | null;
          hotel_id: string | null;
          id: string;
          question: string;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          answer: string;
          category?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          hotel_id?: string | null;
          id?: string;
          question: string;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          answer?: string;
          category?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          hotel_id?: string | null;
          id?: string;
          question?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "faqs_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      feedback: {
        Row: {
          channel: string | null;
          comment: string | null;
          created_at: string | null;
          hotel_id: string | null;
          hotel_slug: string | null;
          id: string;
          rated_at: string | null;
          rating: number | null;
          session_id: string;
          status: string | null;
        };
        Insert: {
          channel?: string | null;
          comment?: string | null;
          created_at?: string | null;
          hotel_id?: string | null;
          hotel_slug?: string | null;
          id?: string;
          rated_at?: string | null;
          rating?: number | null;
          session_id: string;
          status?: string | null;
        };
        Update: {
          channel?: string | null;
          comment?: string | null;
          created_at?: string | null;
          hotel_id?: string | null;
          hotel_slug?: string | null;
          id?: string;
          rated_at?: string | null;
          rating?: number | null;
          session_id?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      handoff_sessions: {
        Row: {
          agent_id: string | null;
          channel: string | null;
          created_at: string;
          hotel_id: string;
          id: string;
          reason: string | null;
          resolved_at: string | null;
          sender_id: string | null;
          session_id: string;
          status: string;
        };
        Insert: {
          agent_id?: string | null;
          channel?: string | null;
          created_at?: string;
          hotel_id: string;
          id?: string;
          reason?: string | null;
          resolved_at?: string | null;
          sender_id?: string | null;
          session_id: string;
          status?: string;
        };
        Update: {
          agent_id?: string | null;
          channel?: string | null;
          created_at?: string;
          hotel_id?: string;
          id?: string;
          reason?: string | null;
          resolved_at?: string | null;
          sender_id?: string | null;
          session_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "handoff_sessions_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      hotels: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          channel: string | null;
          check_in: string | null;
          check_out: string | null;
          created_at: string;
          email: string | null;
          guests: number | null;
          hotel_id: string;
          id: string;
          lead_quality: number | null;
          name: string | null;
          phone: string | null;
          purpose: string | null;
          session_id: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          channel?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string;
          email?: string | null;
          guests?: number | null;
          hotel_id: string;
          id?: string;
          lead_quality?: number | null;
          name?: string | null;
          phone?: string | null;
          purpose?: string | null;
          session_id?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          channel?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string;
          email?: string | null;
          guests?: number | null;
          hotel_id?: string;
          id?: string;
          lead_quality?: number | null;
          name?: string | null;
          phone?: string | null;
          purpose?: string | null;
          session_id?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      menu_items: {
        Row: {
          available: boolean | null;
          category: string | null;
          created_at: string | null;
          description: string | null;
          hotel_id: string;
          id: string;
          image_url: string | null;
          name: string;
          prep_time_mins: number | null;
          price: number | null;
          updated_at: string | null;
        };
        Insert: {
          available?: boolean | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          hotel_id: string;
          id?: string;
          image_url?: string | null;
          name: string;
          prep_time_mins?: number | null;
          price?: number | null;
          updated_at?: string | null;
        };
        Update: {
          available?: boolean | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          hotel_id?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          prep_time_mins?: number | null;
          price?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      message_events: {
        Row: {
          channel: string | null;
          created_at: string;
          hotel_id: string;
          id: string;
          intent: string | null;
          lang: string | null;
          response_ms: number | null;
          session_id: string | null;
        };
        Insert: {
          channel?: string | null;
          created_at?: string;
          hotel_id: string;
          id?: string;
          intent?: string | null;
          lang?: string | null;
          response_ms?: number | null;
          session_id?: string | null;
        };
        Update: {
          channel?: string | null;
          created_at?: string;
          hotel_id?: string;
          id?: string;
          intent?: string | null;
          lang?: string | null;
          response_ms?: number | null;
          session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "message_events_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string | null;
          hotel_id: string | null;
          id: string;
          link: string | null;
          read: boolean | null;
          title: string | null;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string | null;
          hotel_id?: string | null;
          id?: string;
          link?: string | null;
          read?: boolean | null;
          title?: string | null;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string | null;
          hotel_id?: string | null;
          id?: string;
          link?: string | null;
          read?: boolean | null;
          title?: string | null;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          channel: string | null;
          created_at: string | null;
          fee_amount: number | null;
          fee_rate: number | null;
          folio_posted: boolean | null;
          hotel_id: string | null;
          id: string;
          items: Json | null;
          notes: string | null;
          room_number: string | null;
          session_id: string | null;
          status: string | null;
          total_amount: number | null;
          updated_at: string | null;
        };
        Insert: {
          channel?: string | null;
          created_at?: string | null;
          fee_amount?: number | null;
          fee_rate?: number | null;
          folio_posted?: boolean | null;
          hotel_id?: string | null;
          id?: string;
          items?: Json | null;
          notes?: string | null;
          room_number?: string | null;
          session_id?: string | null;
          status?: string | null;
          total_amount?: number | null;
          updated_at?: string | null;
        };
        Update: {
          channel?: string | null;
          created_at?: string | null;
          fee_amount?: number | null;
          fee_rate?: number | null;
          folio_posted?: boolean | null;
          hotel_id?: string | null;
          id?: string;
          items?: Json | null;
          notes?: string | null;
          room_number?: string | null;
          session_id?: string | null;
          status?: string | null;
          total_amount?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      rooms: {
        Row: {
          amenities: string[] | null;
          available: boolean | null;
          capacity: number | null;
          created_at: string | null;
          description: string | null;
          hotel_id: string | null;
          id: string;
          image_urls: string[] | null;
          rate: number | null;
          room_id: string | null;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          amenities?: string[] | null;
          available?: boolean | null;
          capacity?: number | null;
          created_at?: string | null;
          description?: string | null;
          hotel_id?: string | null;
          id?: string;
          image_urls?: string[] | null;
          rate?: number | null;
          room_id?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          amenities?: string[] | null;
          available?: boolean | null;
          capacity?: number | null;
          created_at?: string | null;
          description?: string | null;
          hotel_id?: string | null;
          id?: string;
          image_urls?: string[] | null;
          rate?: number | null;
          room_id?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rooms_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      service_requests: {
        Row: {
          channel: string | null;
          created_at: string | null;
          details: Json | null;
          hotel_id: string | null;
          id: string;
          room_number: string | null;
          scheduled_for: string | null;
          service_type: string | null;
          session_id: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          channel?: string | null;
          created_at?: string | null;
          details?: Json | null;
          hotel_id?: string | null;
          id?: string;
          room_number?: string | null;
          scheduled_for?: string | null;
          service_type?: string | null;
          session_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          channel?: string | null;
          created_at?: string | null;
          details?: Json | null;
          hotel_id?: string | null;
          id?: string;
          room_number?: string | null;
          scheduled_for?: string | null;
          service_type?: string | null;
          session_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_requests_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          created_at: string | null;
          hotel_id: string;
          hotel_slug: string;
          id: string;
          status: "trial" | "active" | "past_due" | "canceled";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tier: string;
          trial_start: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          hotel_id: string;
          hotel_slug: string;
          id?: string;
          status?: "trial" | "active" | "past_due" | "canceled";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: string;
          trial_start?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          hotel_id?: string;
          hotel_slug?: string;
          id?: string;
          status?: "trial" | "active" | "past_due" | "canceled";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: string;
          trial_start?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      upsells: {
        Row: {
          active: boolean | null;
          category: string | null;
          conversion_count: number | null;
          created_at: string | null;
          description: string | null;
          hotel_id: string | null;
          id: string;
          name: string | null;
          price: number | null;
        };
        Insert: {
          active?: boolean | null;
          category?: string | null;
          conversion_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          hotel_id?: string | null;
          id?: string;
          name?: string | null;
          price?: number | null;
        };
        Update: {
          active?: boolean | null;
          category?: string | null;
          conversion_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          hotel_id?: string | null;
          id?: string;
          name?: string | null;
          price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "upsells_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          full_name: string | null;
          hotel_id: string | null;
          id: string;
          last_login: string | null;
          online_status: boolean | null;
          receive_handoff_alerts: boolean | null;
          role: "super_admin" | "agency_staff" | "hotel_manager" | "hotel_receptionist" | "hotel_readonly";
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          hotel_id?: string | null;
          id: string;
          last_login?: string | null;
          online_status?: boolean | null;
          receive_handoff_alerts?: boolean | null;
          role?: "super_admin" | "agency_staff" | "hotel_manager" | "hotel_receptionist" | "hotel_readonly";
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          hotel_id?: string | null;
          id?: string;
          last_login?: string | null;
          online_status?: boolean | null;
          receive_handoff_alerts?: boolean | null;
          role?: "super_admin" | "agency_staff" | "hotel_manager" | "hotel_receptionist" | "hotel_readonly";
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
      whatsapp_accounts: {
        Row: {
          access_token: string | null;
          callback_url: string | null;
          connected_at: string | null;
          connected_via: string | null;
          created_at: string | null;
          display_name: string | null;
          hotel_id: string | null;
          id: string;
          openbsp_token_id: string | null;
          phone_number: string | null;
          phone_number_id: string | null;
          status: string | null;
          updated_at: string | null;
          verify_token: string | null;
          waba_id: string | null;
        };
        Insert: {
          access_token?: string | null;
          callback_url?: string | null;
          connected_at?: string | null;
          connected_via?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          hotel_id?: string | null;
          id?: string;
          openbsp_token_id?: string | null;
          phone_number?: string | null;
          phone_number_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
          verify_token?: string | null;
          waba_id?: string | null;
        };
        Update: {
          access_token?: string | null;
          callback_url?: string | null;
          connected_at?: string | null;
          connected_via?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          hotel_id?: string | null;
          id?: string;
          openbsp_token_id?: string | null;
          phone_number?: string | null;
          phone_number_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
          verify_token?: string | null;
          waba_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_accounts_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      inbox_sessions: {
        Row: {
          agent_id: string | null;
          channel: string | null;
          guest_email: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          handoff_status: string | null;
          hotel_id: string | null;
          last_message: string | null;
          last_message_at: string | null;
          session_id: string | null;
        };
      };
    };
  };
};
