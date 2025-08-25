import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export interface RSVP {
  id: string
  eventId: string
  attendeeName: string
  attendeeEmail: string
  status: "pending" | "confirmed" | "declined"
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRSVPData {
  attendeeName: string
  attendeeEmail: string
  notes?: string
}

type RSVPRow = Database["public"]["Tables"]["rsvps"]["Row"]
type RSVPInsert = Database["public"]["Tables"]["rsvps"]["Insert"]
type RSVPUpdate = Database["public"]["Tables"]["rsvps"]["Update"]

export class RSVPService {
  static async getRSVPsForEvent(eventId: string): Promise<RSVP[]> {
    try {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("RSVPs table does not exist yet. Please run the database schema script.")
          return []
        }
        throw new Error(`Failed to fetch RSVPs: ${error.message}`)
      }

      return this.mapRSVPsFromDatabase(data || [])
    } catch (error) {
      console.warn("Database not available:", error)
      return []
    }
  }

  static async createRSVP(eventId: string, data: CreateRSVPData): Promise<RSVP> {
    try {
      // Check if email already exists for this event
      const existingRSVP = await this.getRSVPByEmail(eventId, data.attendeeEmail)
      if (existingRSVP) {
        throw new Error("You have already RSVP'd for this event")
      }

      const rsvpData: RSVPInsert = {
        event_id: eventId,
        attendee_name: data.attendeeName,
        attendee_email: data.attendeeEmail,
        status: "confirmed",
        notes: data.notes || null,
      }

      const { data: newRSVP, error } = await supabase.from("rsvps").insert(rsvpData).select().single()

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          throw new Error(
            "Database tables not set up yet. Please add Supabase integration and run the database schema script.",
          )
        }
        throw new Error(`Failed to create RSVP: ${error.message}`)
      }

      return this.mapRSVPFromDatabase(newRSVP)
    } catch (error: any) {
      if (error.message.includes("Database tables not set up") || error.message.includes("already RSVP'd")) {
        throw error
      }
      throw new Error(`Failed to create RSVP: ${error.message || "Database connection error"}`)
    }
  }

  static async updateRSVPStatus(id: string, status: RSVP["status"]): Promise<RSVP> {
    try {
      const { data: updatedRSVP, error } = await supabase
        .from("rsvps")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          throw new Error(
            "Database tables not set up yet. Please add Supabase integration and run the database schema script.",
          )
        }
        throw new Error(`Failed to update RSVP status: ${error.message}`)
      }

      return this.mapRSVPFromDatabase(updatedRSVP)
    } catch (error: any) {
      throw new Error(`Failed to update RSVP status: ${error.message || "Database connection error"}`)
    }
  }

  static async getRSVPByEmail(eventId: string, email: string): Promise<RSVP | null> {
    try {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("attendee_email", email)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null // RSVP not found
        }
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("RSVPs table does not exist yet. Please run the database schema script.")
          return null
        }
        throw new Error(`Failed to fetch RSVP: ${error.message}`)
      }

      return this.mapRSVPFromDatabase(data)
    } catch (error) {
      console.warn("Database not available:", error)
      return null
    }
  }

  static async deleteRSVP(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("rsvps").delete().eq("id", id)

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          throw new Error(
            "Database tables not set up yet. Please add Supabase integration and run the database schema script.",
          )
        }
        throw new Error(`Failed to delete RSVP: ${error.message}`)
      }
    } catch (error: any) {
      throw new Error(`Failed to delete RSVP: ${error.message || "Database connection error"}`)
    }
  }

  static async getEventStats(eventId: string) {
    try {
      const { data, error } = await supabase.from("rsvps").select("status").eq("event_id", eventId)

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("RSVPs table does not exist yet. Please run the database schema script.")
          return {
            total: 0,
            confirmed: 0,
            pending: 0,
            declined: 0,
          }
        }
        throw new Error(`Failed to fetch event stats: ${error.message}`)
      }

      const rsvps = data || []
      return {
        total: rsvps.length,
        confirmed: rsvps.filter((rsvp) => rsvp.status === "confirmed").length,
        pending: rsvps.filter((rsvp) => rsvp.status === "pending").length,
        declined: rsvps.filter((rsvp) => rsvp.status === "declined").length,
      }
    } catch (error) {
      console.warn("Database not available:", error)
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        declined: 0,
      }
    }
  }

  private static mapRSVPFromDatabase(row: RSVPRow): RSVP {
    return {
      id: row.id,
      eventId: row.event_id,
      attendeeName: row.attendee_name,
      attendeeEmail: row.attendee_email,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private static mapRSVPsFromDatabase(rows: RSVPRow[]): RSVP[] {
    return rows.map(this.mapRSVPFromDatabase)
  }
}
