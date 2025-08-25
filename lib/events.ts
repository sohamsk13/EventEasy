import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export interface Event {
  id: string
  title: string
  description: string | null
  eventDate: string
  endDate?: string | null
  location: string | null
  maxAttendees?: number | null
  isPublic: boolean
  status: "draft" | "published" | "cancelled" | "completed"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventData {
  title: string
  description: string
  eventDate: string
  endDate?: string
  location: string
  maxAttendees?: number
  isPublic: boolean
}

type EventRow = Database["public"]["Tables"]["events"]["Row"]
type EventInsert = Database["public"]["Tables"]["events"]["Insert"]
type EventUpdate = Database["public"]["Tables"]["events"]["Update"]

export class EventService {
  static async getEvents(userId?: string): Promise<Event[]> {
    try {
      let query = supabase.from("events").select("*").order("created_at", { ascending: false })

      // Filter events based on user ownership if userId provided
      if (userId) {
        query = query.eq("created_by", userId)
      }

      const { data, error } = await query

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("Events table does not exist yet. Please run the database schema script.")
          return []
        }
        throw new Error(`Failed to fetch events: ${error.message}`)
      }

      return this.mapEventsFromDatabase(data || [])
    } catch (error) {
      console.warn("Database not available:", error)
      return []
    }
  }

  static async getEvent(id: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null // Event not found
        }
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("Events table does not exist yet. Please run the database schema script.")
          return null
        }
        throw new Error(`Failed to fetch event: ${error.message}`)
      }

      return this.mapEventFromDatabase(data)
    } catch (error) {
      console.warn("Database not available:", error)
      return null
    }
  }

  static async createEvent(data: CreateEventData, userId: string): Promise<Event> {
    try {
      const eventData: EventInsert = {
        title: data.title,
        description: data.description,
        event_date: data.eventDate,
        end_date: data.endDate || null,
        location: data.location,
        max_attendees: data.maxAttendees || null,
        is_public: data.isPublic,
        status: "draft",
        created_by: userId,
      }

      const { data: newEvent, error } = await supabase.from("events").insert(eventData).select().single()

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          throw new Error(
            "Database tables not set up yet. Please add Supabase integration and run the database schema script.",
          )
        }
        throw new Error(`Failed to create event: ${error.message}`)
      }

      return this.mapEventFromDatabase(newEvent)
    } catch (error: any) {
      if (error.message.includes("Database tables not set up")) {
        throw error
      }
      throw new Error(`Failed to create event: ${error.message || "Database connection error"}`)
    }
  }

  static async updateEvent(id: string, data: Partial<CreateEventData>): Promise<Event> {
    try {
      const updateData: EventUpdate = {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.eventDate && { event_date: data.eventDate }),
        ...(data.endDate !== undefined && { end_date: data.endDate || null }),
        ...(data.location && { location: data.location }),
        ...(data.maxAttendees !== undefined && { max_attendees: data.maxAttendees || null }),
        ...(data.isPublic !== undefined && { is_public: data.isPublic }),
        updated_at: new Date().toISOString(),
      }

      const { data: updatedEvent, error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          throw new Error(
            "Database tables not set up yet. Please add Supabase integration and run the database schema script.",
          )
        }
        throw new Error(`Failed to update event: ${error.message}`)
      }

      return this.mapEventFromDatabase(updatedEvent)
    } catch (error: any) {
      throw new Error(`Failed to update event: ${error.message || "Database connection error"}`)
    }
  }

  static async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id)

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          throw new Error(
            "Database tables not set up yet. Please add Supabase integration and run the database schema script.",
          )
        }
        throw new Error(`Failed to delete event: ${error.message}`)
      }
    } catch (error: any) {
      throw new Error(`Failed to delete event: ${error.message || "Database connection error"}`)
    }
  }

  static async updateEventStatus(id: string, status: Event["status"]): Promise<Event> {
    try {
      const { data: updatedEvent, error } = await supabase
        .from("events")
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
        throw new Error(`Failed to update event status: ${error.message}`)
      }

      return this.mapEventFromDatabase(updatedEvent)
    } catch (error: any) {
      throw new Error(`Failed to update event status: ${error.message || "Database connection error"}`)
    }
  }

  static async getPublicEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_public", true)
        .eq("status", "published")
        .order("event_date", { ascending: true })

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("Events table does not exist yet. Please run the database schema script.")
          return []
        }
        throw new Error(`Failed to fetch public events: ${error.message}`)
      }

      return this.mapEventsFromDatabase(data || [])
    } catch (error) {
      console.warn("Database not available:", error)
      return []
    }
  }

  private static mapEventFromDatabase(row: EventRow): Event {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      eventDate: row.event_date,
      endDate: row.end_date,
      location: row.location,
      maxAttendees: row.max_attendees,
      isPublic: row.is_public,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private static mapEventsFromDatabase(rows: EventRow[]): Event[] {
    return rows.map(this.mapEventFromDatabase)
  }
}
