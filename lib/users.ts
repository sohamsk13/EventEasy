import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type { User } from "@/lib/auth"

export interface UserWithStats extends User {
  eventsCreated: number
  lastLogin: string
  createdAt: string
}

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  role: User["role"]
  password: string
}

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

export class UserService {
  static async getAllUsers(): Promise<UserWithStats[]> {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      throw new Error(`Failed to fetch users: ${profilesError.message}`)
    }

    // Get event counts for each user
    const usersWithStats = await Promise.all(
      profiles.map(async (profile) => {
        const { count } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("created_by", profile.id)

        return {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
          eventsCreated: count || 0,
          lastLogin: profile.updated_at, // Using updated_at as proxy for last login
          createdAt: profile.created_at,
        }
      }),
    )

    return usersWithStats
  }

  static async getUserById(id: string): Promise<UserWithStats | null> {
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    // Get event count for this user
    const { count } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("created_by", profile.id)

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      eventsCreated: count || 0,
      lastLogin: profile.updated_at,
      createdAt: profile.created_at,
    }
  }

  static async createUser(data: CreateUserData): Promise<UserWithStats> {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
        },
      },
    })

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("Failed to create user")
    }

    return {
      id: authData.user.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      eventsCreated: 0,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  }

  static async updateUser(id: string, data: Partial<CreateUserData>): Promise<UserWithStats> {
    const updateData: any = {}
    if (data.email) updateData.email = data.email
    if (data.firstName) updateData.first_name = data.firstName
    if (data.lastName) updateData.last_name = data.lastName
    if (data.role) updateData.role = data.role

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    // Get event count for this user
    const { count } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("created_by", updatedProfile.id)

    return {
      id: updatedProfile.id,
      email: updatedProfile.email,
      firstName: updatedProfile.first_name,
      lastName: updatedProfile.last_name,
      role: updatedProfile.role,
      eventsCreated: count || 0,
      lastLogin: updatedProfile.updated_at,
      createdAt: updatedProfile.created_at,
    }
  }

  static async deleteUser(id: string): Promise<void> {
    // Delete from Supabase Auth (this will cascade to profiles table)
    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  static async getUsersByRole(role: User["role"]): Promise<UserWithStats[]> {
    const { data: profiles, error } = await supabase.from("profiles").select("*").eq("role", role)

    if (error) {
      throw new Error(`Failed to fetch users by role: ${error.message}`)
    }

    // Get event counts for each user
    const usersWithStats = await Promise.all(
      profiles.map(async (profile) => {
        const { count } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("created_by", profile.id)

        return {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
          eventsCreated: count || 0,
          lastLogin: profile.updated_at,
          createdAt: profile.created_at,
        }
      }),
    )

    return usersWithStats
  }

  static async getSystemStats() {
    // Get total user count by role
    const { data: profiles, error } = await supabase.from("profiles").select("role, created_at")

    if (error) {
      throw new Error(`Failed to fetch system stats: ${error.message}`)
    }

    const totalUsers = profiles.length
    const adminCount = profiles.filter((p) => p.role === "admin").length
    const staffCount = profiles.filter((p) => p.role === "staff").length
    const ownerCount = profiles.filter((p) => p.role === "event_owner").length

    // Calculate active users (created in last 7 days as proxy)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeUsers = profiles.filter((p) => new Date(p.created_at) > sevenDaysAgo).length

    return {
      totalUsers,
      adminCount,
      staffCount,
      ownerCount,
      activeUsers,
    }
  }
}
