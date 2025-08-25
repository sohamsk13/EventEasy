"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, BarChart3, Shield, Loader2, LogOut } from "lucide-react"
import Link from "next/link"
import { UserService } from "@/lib/users"
import { EventService } from "@/lib/events"
import { RSVPService } from "@/lib/rsvp"

function AdminDashboardContent() {
  const { user, logout } = useAuth()
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    staffCount: 0,
    ownerCount: 0,
    activeUsers: 0,
  })
  const [eventStats, setEventStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    totalRSVPs: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load system stats
      const userStats = UserService.getSystemStats()
      setSystemStats(userStats)

      // Load event stats
      const events = await EventService.getEvents()
      const publishedEvents = events.filter((event) => event.status === "published")
      const draftEvents = events.filter((event) => event.status === "draft")

      // Calculate total RSVPs across all events
      let totalRSVPs = 0
      for (const event of events) {
        const stats = RSVPService.getEventStats(event.id)
        totalRSVPs += stats.total
      }

      setEventStats({
        totalEvents: events.length,
        publishedEvents: publishedEvents.length,
        draftEvents: draftEvents.length,
        totalRSVPs,
      })
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
      // The error is already handled in the auth context, but we log it here for debugging
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-serif text-foreground">Admin Panel</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
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
          <h2 className="text-3xl font-bold font-serif text-foreground mb-2">System Overview</h2>
          <p className="text-muted-foreground">Monitor and manage your EventEase platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{systemStats.activeUsers} active this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{eventStats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">{eventStats.publishedEvents} published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total RSVPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{eventStats.totalRSVPs}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{systemStats.staffCount}</div>
              <p className="text-xs text-muted-foreground">{systemStats.adminCount} administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-serif">User Management</CardTitle>
              <CardDescription>Manage users, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-serif">Event Oversight</CardTitle>
              <CardDescription>Monitor and manage all events</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/events">
                <Button className="w-full bg-transparent" variant="outline">
                  View All Events
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-serif">Analytics</CardTitle>
              <CardDescription>View system analytics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full bg-transparent" variant="outline">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* User Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">User Roles Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">Admin</Badge>
                    <span className="text-sm">Administrators</span>
                  </div>
                  <span className="font-medium">{systemStats.adminCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">Staff</Badge>
                    <span className="text-sm">Staff Members</span>
                  </div>
                  <span className="font-medium">{systemStats.staffCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Owner</Badge>
                    <span className="text-sm">Event Owners</span>
                  </div>
                  <span className="font-medium">{systemStats.ownerCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Event Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Published</Badge>
                    <span className="text-sm">Live Events</span>
                  </div>
                  <span className="font-medium">{eventStats.publishedEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
                    <span className="text-sm">Draft Events</span>
                  </div>
                  <span className="font-medium">{eventStats.draftEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Total</Badge>
                    <span className="text-sm">All Events</span>
                  </div>
                  <span className="font-medium">{eventStats.totalEvents}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
