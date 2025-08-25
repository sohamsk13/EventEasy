"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { AuthService, type User, type AuthState } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string, role?: User["role"]) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })

  useEffect(() => {
    const initializeAuth = async () => {
      const user = await AuthService.getCurrentUser()
      setState({ user, isLoading: false })
    }

    initializeAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((user) => {
      setState({ user, isLoading: false })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await AuthService.login(email, password)
      setState({ user, isLoading: false })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: User["role"],
  ) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await AuthService.register(email, password, firstName, lastName, role)
      setState({ user, isLoading: false })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      await AuthService.logout()
      setState({ user: null, isLoading: false })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  return <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
