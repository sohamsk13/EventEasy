export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: "admin" | "staff" | "event_owner"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role?: "admin" | "staff" | "event_owner"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: "admin" | "staff" | "event_owner"
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          end_date: string | null
          location: string | null
          max_attendees: number | null
          is_public: boolean
          status: "draft" | "published" | "cancelled" | "completed"
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          end_date?: string | null
          location?: string | null
          max_attendees?: number | null
          is_public?: boolean
          status?: "draft" | "published" | "cancelled" | "completed"
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          end_date?: string | null
          location?: string | null
          max_attendees?: number | null
          is_public?: boolean
          status?: "draft" | "published" | "cancelled" | "completed"
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      rsvps: {
        Row: {
          id: string
          event_id: string
          attendee_name: string
          attendee_email: string
          status: "pending" | "confirmed" | "declined"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          attendee_name: string
          attendee_email: string
          status?: "pending" | "confirmed" | "declined"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          attendee_name?: string
          attendee_email?: string
          status?: "pending" | "confirmed" | "declined"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_staff: {
        Row: {
          id: string
          event_id: string
          user_id: string
          role: string
          assigned_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          role: string
          assigned_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          role?: string
          assigned_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
