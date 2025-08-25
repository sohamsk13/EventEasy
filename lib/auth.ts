import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "staff" | "event_owner"
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export class AuthService {
  static async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error("Login failed")
    }

    const profile = await this.getUserProfile(data.user.id)
    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
      }
    }

    // Fallback to user metadata if profiles table doesn't exist
    const userMetadata = data.user.user_metadata
    return {
      id: data.user.id,
      email: data.user.email || email,
      firstName: userMetadata?.first_name || "User",
      lastName: userMetadata?.last_name || "",
      role: userMetadata?.role || "event_owner",
    }
  }

  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: User["role"] = "event_owner",
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error("Registration failed")
    }

    return {
      id: data.user.id,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
    }
  }

  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const profile = await this.getUserProfile(user.id)
    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
      }
    }

    // Fallback to user metadata if profiles table doesn't exist
    const userMetadata = user.user_metadata
    return {
      id: user.id,
      email: user.email || "",
      firstName: userMetadata?.first_name || "User",
      lastName: userMetadata?.last_name || "",
      role: userMetadata?.role || "event_owner",
    }
  }

  private static async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        if (
          error.code === "PGRST116" ||
          error.message.includes("relation") ||
          error.message.includes("does not exist")
        ) {
          return null
        }
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    } catch (error) {
      return null
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}
