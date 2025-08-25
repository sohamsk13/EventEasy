"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, MapPin, Users, ArrowLeft, Edit, Trash2, Eye, Loader2, Share2 } from "lucide-react"
import Link from "next/link"
import { EventService, type Event } from "@/lib/events"

function EventDetailsContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id as string)
    }
  }, [params.id])

  const loadEvent = async (eventId: string) => {
    try {
      setIsLoading(true)
      const eventData = await EventService.getEvent(eventId)
      if (!eventData) {
        setError("Event not found")
        return
      }
      setEvent(eventData)
    } catch (err) {
      setError("Failed to load event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event || !confirm("Are you sure you want to delete this event?")) return

    try {
      await EventService.deleteEvent(event.id)
      router.push("/events")
    } catch (err) {
      setError("Failed to delete event")
    }
  }

  const handleStatusChange = async (status: Event["status"]) => {
    if (!event) return

    try {
      await EventService.updateEventStatus(event.id, status)
      setEvent({ ...event, status })
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

  const canEdit = user && event && (user.role === "admin" || event.createdBy === user.id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/events" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Events
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "Event not found"}</AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/events" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </Link>
          {canEdit && (
            <div className="flex items-center space-x-2">
              <Link href={`/events/${event.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteEvent}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Event Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                    {event.isPublic && <Badge variant="outline">Public</Badge>}
                  </div>
                  <CardTitle className="text-3xl font-serif mb-2">{event.title}</CardTitle>
                  <CardDescription className="text-lg">{event.description}</CardDescription>
                </div>
                {event.isPublic && event.status === "published" && (
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p>{formatDate(event.eventDate)}</p>
                  </div>
                </div>
                {event.endDate && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">End Date</p>
                      <p>{formatDate(event.endDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>
                {event.maxAttendees && (
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Maximum Attendees</p>
                      <p>{event.maxAttendees}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.status === "draft" && canEdit && (
                  <Button onClick={() => handleStatusChange("published")} className="w-full">
                    Publish Event
                  </Button>
                )}
                {event.status === "published" && canEdit && (
                  <Button onClick={() => handleStatusChange("cancelled")} variant="outline" className="w-full">
                    Cancel Event
                  </Button>
                )}
                {event.isPublic && event.status === "published" && (
                  <Link href={`/events/public/${event.id}`} className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Page
                    </Button>
                  </Link>
                )}
                <Link href={`/events/${event.id}/attendees`} className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Attendees
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Event Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Event Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Total RSVPs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{event.maxAttendees || "∞"}</p>
                  <p className="text-sm text-muted-foreground">Max Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function EventDetailsPage() {
  return (
    <ProtectedRoute>
      <EventDetailsContent />
    </ProtectedRoute>
  )
}
