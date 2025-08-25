"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, MapPin, Users, ArrowLeft, Loader2, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { EventService, type Event } from "@/lib/events"
import { RSVPService, type CreateRSVPData, type RSVP } from "@/lib/rsvp"

export default function PublicEventPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [existingRSVP, setExistingRSVP] = useState<RSVP | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showRSVPForm, setShowRSVPForm] = useState(false)
  const [eventStats, setEventStats] = useState({ total: 0, confirmed: 0, pending: 0, declined: 0 })
  const [formData, setFormData] = useState<CreateRSVPData>({
    attendeeName: "",
    attendeeEmail: "",
    notes: "",
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
      if (!eventData || !eventData.isPublic || eventData.status !== "published") {
        setError("Event not found or not available")
        return
      }
      setEvent(eventData)
      setEventStats(RSVPService.getEventStats(eventId))
    } catch (err) {
      setError("Failed to load event")
    } finally {
      setIsLoading(false)
    }
  }

  const checkExistingRSVP = async (email: string) => {
    if (!event) return

    try {
      const rsvp = await RSVPService.getRSVPByEmail(event.id, email)
      setExistingRSVP(rsvp)
    } catch (err) {
      // Ignore error - no existing RSVP
    }
  }

  const handleSubmitRSVP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!event) return

    // Validate required fields
    if (!formData.attendeeName || !formData.attendeeEmail) {
      setError("Please fill in all required fields")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.attendeeEmail)) {
      setError("Please enter a valid email address")
      return
    }

    // Check if event is at capacity
    if (event.maxAttendees && eventStats.confirmed >= event.maxAttendees) {
      setError("Sorry, this event is at full capacity")
      return
    }

    try {
      setIsSubmitting(true)
      await RSVPService.createRSVP(event.id, formData)
      setSuccess("Thank you! Your RSVP has been confirmed.")
      setShowRSVPForm(false)
      setEventStats(RSVPService.getEventStats(event.id))

      // Check for the new RSVP
      await checkExistingRSVP(formData.attendeeEmail)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit RSVP")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: keyof CreateRSVPData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const isEventUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  const isEventFull = () => {
    return event?.maxAttendees ? eventStats.confirmed >= event.maxAttendees : false
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
            <Link href="/events/public" className="flex items-center text-muted-foreground hover:text-foreground">
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

  const isUpcoming = isEventUpcoming(event.eventDate)
  const isFull = isEventFull()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/events/public" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </Link>
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold font-serif">EventEase</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Event Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {isUpcoming ? (
                  <Badge className="bg-green-100 text-green-800">Upcoming Event</Badge>
                ) : (
                  <Badge variant="outline">Past Event</Badge>
                )}
                {isFull && <Badge className="bg-red-100 text-red-800">Full</Badge>}
              </div>
              <CardTitle className="text-4xl font-serif mb-4">{event.title}</CardTitle>
              <CardDescription className="text-lg leading-relaxed">{event.description}</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p>{formatDate(event.eventDate)}</p>
                      {event.endDate && <p>Until {formatDate(event.endDate)}</p>}
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p>{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Attendance</p>
                      <p>
                        {eventStats.confirmed} confirmed
                        {event.maxAttendees && ` of ${event.maxAttendees} max`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">RSVP Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{eventStats.total}</p>
                      <p className="text-sm text-muted-foreground">Total RSVPs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{eventStats.confirmed}</p>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{eventStats.pending}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{eventStats.declined}</p>
                      <p className="text-sm text-muted-foreground">Declined</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RSVP Section */}
            <div className="space-y-6">
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {existingRSVP ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      You're Registered!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Name:</strong> {existingRSVP.attendeeName}
                      </p>
                      <p>
                        <strong>Email:</strong> {existingRSVP.attendeeEmail}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <Badge
                          className={
                            existingRSVP.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : existingRSVP.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {existingRSVP.status.charAt(0).toUpperCase() + existingRSVP.status.slice(1)}
                        </Badge>
                      </p>
                      {existingRSVP.notes && (
                        <p>
                          <strong>Notes:</strong> {existingRSVP.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : isUpcoming && !isFull ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">RSVP for this Event</CardTitle>
                    <CardDescription>Secure your spot at this event</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showRSVPForm ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Join {eventStats.confirmed} others who have already confirmed their attendance.
                        </p>
                        <Button onClick={() => setShowRSVPForm(true)} className="w-full">
                          RSVP Now
                        </Button>
                        <div className="text-center">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              const email = prompt("Enter your email to check existing RSVP:")
                              if (email) checkExistingRSVP(email)
                            }}
                          >
                            Check existing RSVP
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitRSVP} className="space-y-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="attendeeName">Full Name *</Label>
                          <Input
                            id="attendeeName"
                            value={formData.attendeeName}
                            onChange={(e) => updateFormData("attendeeName", e.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="attendeeEmail">Email Address *</Label>
                          <Input
                            id="attendeeEmail"
                            type="email"
                            value={formData.attendeeEmail}
                            onChange={(e) => updateFormData("attendeeEmail", e.target.value)}
                            placeholder="Enter your email"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => updateFormData("notes", e.target.value)}
                            placeholder="Any special requirements or comments?"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm RSVP
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowRSVPForm(false)}
                            className="bg-transparent"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-semibold font-serif mb-2">{isFull ? "Event is Full" : "RSVP Closed"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isFull
                        ? "This event has reached maximum capacity"
                        : "RSVP is no longer available for this event"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
