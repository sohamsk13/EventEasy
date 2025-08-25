"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"

function DashboardContent() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
      // The error is already handled in the auth context, but we log it here for debugging
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator"
      case "staff":
        return "Staff Member"
      case "event_owner":
        return "Event Owner"
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-serif text-foreground">EventEase</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Role: <span className="font-medium">{getRoleDisplayName(user?.role || "")}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-serif">My Events</CardTitle>
              <CardDescription>View and manage your events</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/events">
                <Button className="w-full">View Events</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-serif">Attendees</CardTitle>
              <CardDescription>Manage event attendees and RSVPs</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/attendees">
                <Button className="w-full bg-transparent" variant="outline">
                  Manage Attendees
                </Button>
              </Link>
            </CardContent>
          </Card>

          {(user?.role === "admin" || user?.role === "staff") && (
            <Card>
              <CardHeader>
                <Settings className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="font-serif">Administration</CardTitle>
                <CardDescription>System administration and user management</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button className="w-full bg-transparent" variant="outline">
                    Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent Activity</CardTitle>
            <CardDescription>Your latest events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity to display</p>
              <p className="text-sm">Create your first event to get started!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
