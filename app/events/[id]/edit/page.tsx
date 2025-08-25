"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { EventService, type Event, type CreateEventData } from "@/lib/events"

function EditEventContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    description: "",
    eventDate: "",
    endDate: "",
    location: "",
    maxAttendees: undefined,
    isPublic: true,
  })

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

      // Check if user can edit this event
      if (user && user.role !== "admin" && eventData.createdBy !== user.id) {
        setError("You don't have permission to edit this event")
        return
      }

      setEvent(eventData)
      setFormData({
        title: eventData.title,
        description: eventData.description,
        eventDate: eventData.eventDate.slice(0, 16), // Format for datetime-local input
        endDate: eventData.endDate ? eventData.endDate.slice(0, 16) : "",
        location: eventData.location,
        maxAttendees: eventData.maxAttendees,
        isPublic: eventData.isPublic,
      })
    } catch (err) {
      setError("Failed to load event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!event) return

    // Validate required fields
    if (!formData.title || !formData.description || !formData.eventDate || !formData.location) {
      setError("Please fill in all required fields")
      return
    }

    // Validate date
    const eventDate = new Date(formData.eventDate)
    if (eventDate < new Date() && event.status === "draft") {
      setError("Event date must be in the future")
      return
    }

    // Validate end date if provided
    if (formData.endDate) {
      const endDate = new Date(formData.endDate)
      if (endDate <= eventDate) {
        setError("End date must be after the start date")
        return
      }
    }

    try {
      setIsSaving(true)
      await EventService.updateEvent(event.id, formData)
      router.push(`/events/${event.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event")
    } finally {
      setIsSaving(false)
    }
  }

  const updateFormData = (field: keyof CreateEventData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
          <div className="flex items-center space-x-4">
            <Link
              href={`/events/${event.id}`}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Event
            </Link>
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-serif text-foreground">Edit Event</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Edit Event</CardTitle>
            <CardDescription>Update your event details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Describe your event"
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Start Date & Time *</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => updateFormData("eventDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => updateFormData("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="Event location or venue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={formData.maxAttendees || ""}
                  onChange={(e) =>
                    updateFormData("maxAttendees", e.target.value ? Number.parseInt(e.target.value) : undefined)
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => updateFormData("isPublic", checked)}
                />
                <Label htmlFor="isPublic">Make this event public</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Event
                </Button>
                <Link href={`/events/${event.id}`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function EditEventPage() {
  return (
    <ProtectedRoute>
      <EditEventContent />
    </ProtectedRoute>
  )
}
