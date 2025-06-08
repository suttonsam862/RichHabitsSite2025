export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
          is_admin: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
      }
      sessions: {
        Row: {
          sid: string
          sess: Json
          expire: string
        }
        Insert: {
          sid: string
          sess: Json
          expire: string
        }
        Update: {
          sid?: string
          sess?: Json
          expire?: string
        }
      }
      event_registrations: {
        Row: {
          id: number
          event_id: number
          first_name: string
          last_name: string
          contact_name: string
          email: string
          phone: string
          t_shirt_size: string | null
          grade: string | null
          school_name: string | null
          club_name: string | null
          medical_release_accepted: boolean
          registration_type: string
          created_at: string
          stripe_payment_intent_id: string | null
          shopify_order_id: string | null
          status: string
          discount_code: string | null
          day1: boolean
          day2: boolean
          day3: boolean
          user_id: string | null
        }
        Insert: {
          event_id: number
          first_name: string
          last_name: string
          contact_name: string
          email: string
          phone: string
          t_shirt_size?: string | null
          grade?: string | null
          school_name?: string | null
          club_name?: string | null
          medical_release_accepted: boolean
          registration_type: string
          created_at?: string
          stripe_payment_intent_id?: string | null
          shopify_order_id?: string | null
          status?: string
          discount_code?: string | null
          day1?: boolean
          day2?: boolean
          day3?: boolean
          user_id?: string | null
          id?: number
        }
        Update: {
          event_id?: number
          first_name?: string
          last_name?: string
          contact_name?: string
          email?: string
          phone?: string
          t_shirt_size?: string | null
          grade?: string | null
          school_name?: string | null
          club_name?: string | null
          medical_release_accepted?: boolean
          registration_type?: string
          created_at?: string
          stripe_payment_intent_id?: string | null
          shopify_order_id?: string | null
          status?: string
          discount_code?: string | null
          day1?: boolean
          day2?: boolean
          day3?: boolean
          user_id?: string | null
          id?: number
        }
      }
      completed_event_registrations: {
        Row: {
          id: number
          event_id: number
          first_name: string
          last_name: string
          contact_name: string
          email: string
          phone: string
          t_shirt_size: string | null
          grade: string | null
          school_name: string | null
          club_name: string | null
          medical_release_accepted: boolean
          registration_type: string
          created_at: string
          stripe_payment_intent_id: string | null
          shopify_order_id: string | null
          payment_amount: number | null
          payment_verified: boolean
          discount_code: string | null
          day1: boolean
          day2: boolean
          day3: boolean
          user_id: string | null
        }
        Insert: {
          event_id: number
          first_name: string
          last_name: string
          contact_name: string
          email: string
          phone: string
          t_shirt_size?: string | null
          grade?: string | null
          school_name?: string | null
          club_name?: string | null
          medical_release_accepted: boolean
          registration_type: string
          created_at?: string
          stripe_payment_intent_id?: string | null
          shopify_order_id?: string | null
          payment_amount?: number | null
          payment_verified?: boolean
          discount_code?: string | null
          day1?: boolean
          day2?: boolean
          day3?: boolean
          user_id?: string | null
          id?: number
        }
        Update: {
          event_id?: number
          first_name?: string
          last_name?: string
          contact_name?: string
          email?: string
          phone?: string
          t_shirt_size?: string | null
          grade?: string | null
          school_name?: string | null
          club_name?: string | null
          medical_release_accepted?: boolean
          registration_type?: string
          created_at?: string
          stripe_payment_intent_id?: string | null
          shopify_order_id?: string | null
          payment_amount?: number | null
          payment_verified?: boolean
          discount_code?: string | null
          day1?: boolean
          day2?: boolean
          day3?: boolean
          user_id?: string | null
          id?: number
        }
      }
      products: {
        Row: {
          id: number
          title: string
          description: string
          price: number
          image_url: string
          shopify_id: string
          handle: string
          featured: boolean
          collection_id: number | null
          created_at: string
        }
        Insert: {
          title: string
          description: string
          price: number
          image_url: string
          shopify_id: string
          handle: string
          featured?: boolean
          collection_id?: number | null
          created_at?: string
          id?: number
        }
        Update: {
          title?: string
          description?: string
          price?: number
          image_url?: string
          shopify_id?: string
          handle?: string
          featured?: boolean
          collection_id?: number | null
          created_at?: string
          id?: number
        }
      }
      collections: {
        Row: {
          id: number
          title: string
          description: string
          image_url: string
          shopify_id: string
          handle: string
          created_at: string
        }
        Insert: {
          title: string
          description: string
          image_url: string
          shopify_id: string
          handle: string
          created_at?: string
          id?: number
        }
        Update: {
          title?: string
          description?: string
          image_url?: string
          shopify_id?: string
          handle?: string
          created_at?: string
          id?: number
        }
      }
      events: {
        Row: {
          id: number
          title: string
          description: string
          short_description: string
          date: string
          location: string
          price: number
          capacity: number
          image_url: string
          category: string
          status: string
          created_at: string
          city: string
          state: string
          single_day_price: number | null
          registration_open: boolean
        }
        Insert: {
          title: string
          description: string
          short_description: string
          date: string
          location: string
          price: number
          capacity: number
          image_url: string
          category: string
          status?: string
          created_at?: string
          city: string
          state: string
          single_day_price?: number | null
          registration_open?: boolean
          id?: number
        }
        Update: {
          title?: string
          description?: string
          short_description?: string
          date?: string
          location?: string
          price?: number
          capacity?: number
          image_url?: string
          category?: string
          status?: string
          created_at?: string
          city?: string
          state?: string
          single_day_price?: number | null
          registration_open?: boolean
          id?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}