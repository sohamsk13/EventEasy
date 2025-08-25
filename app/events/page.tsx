"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { EventService, type Event } from "@/lib/events"
import { Alert, AlertDescription } from "@/components/ui/alert"

function EventsContent() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadEvents()
  }, [user])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const eventsData = await EventService.getEvents(user?.id)
      setEvents(eventsData)
    } catch (err) {
      setError("Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      await EventService.deleteEvent(eventId)
      setEvents(events.filter((event) => event.id !== eventId))
    } catch (err) {
      setError("Failed to delete event")
    }
  }

  const handleStatusChange = async (eventId: string, status: Event["status"]) => {
    try {
      await EventService.updateEventStatus(eventId, status)
      setEvents(events.map((event) => (event.id === eventId ? { ...event, status } : event)))
    } catch (err) {
      setError("Failed to update event status")
    }
  }

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-serif text-foreground">EventEase</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <Link href="/events/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-2">My Events</h2>
          <p className="text-muted-foreground">Manage your events and track their performance</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold font-serif mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first event to get started with EventEase</p>
              <Link href="/events/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="font-serif">{event.title}</CardTitle>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                        {event.isPublic && <Badge variant="outline">Public</Badge>}
                      </div>
                      <CardDescription className="text-base">{event.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(event.eventDate)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    {event.maxAttendees && (
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        Max {event.maxAttendees} attendees
                      </div>
                    )}
                  </div>

                  {event.status === "draft" && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button size="sm" onClick={() => handleStatusChange(event.id, "published")}>
                        Publish Event
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <EventsContent />
    </ProtectedRoute>
  )
}
