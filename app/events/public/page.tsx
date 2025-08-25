"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Users, MapPin, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { EventService, type Event } from "@/lib/events"
import { RSVPService } from "@/lib/rsvp"

export default function PublicEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [eventStats, setEventStats] = useState<Record<string, any>>({})

  useEffect(() => {
    loadPublicEvents()
  }, [])

  useEffect(() => {
    // Filter events based on search term
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEvents(filtered)
  }, [events, searchTerm])

  const loadPublicEvents = async () => {
    try {
      setIsLoading(true)
      const publicEvents = await EventService.getPublicEvents()
      setEvents(publicEvents)
      setFilteredEvents(publicEvents)

      // Load RSVP stats for each event
      const stats: Record<string, any> = {}
      for (const event of publicEvents) {
        stats[event.id] = RSVPService.getEventStats(event.id)
      }
      setEventStats(stats)
    } catch (err) {
      console.error("Failed to load public events:", err)
    } finally {
      setIsLoading(false)
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

  const isEventUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
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
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-serif text-foreground">EventEase</h1>
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold font-serif text-foreground mb-4">Discover Amazing Events</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Find and RSVP to exciting events happening in your community
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Events List */}
      <main className="container mx-auto px-4 py-8">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold font-serif mb-2">
                {searchTerm ? "No events found" : "No public events available"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Check back later for upcoming events"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event) => {
              const stats = eventStats[event.id] || { total: 0, confirmed: 0 }
              const isUpcoming = isEventUpcoming(event.eventDate)

              return (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="font-serif text-xl">{event.title}</CardTitle>
                          {isUpcoming ? (
                            <Badge className="bg-green-100 text-green-800">Upcoming</Badge>
                          ) : (
                            <Badge variant="outline">Past Event</Badge>
                          )}
                        </div>
                        <CardDescription className="text-base leading-relaxed">{event.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-6">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.eventDate)}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {stats.confirmed} attending
                        {event.maxAttendees && ` / ${event.maxAttendees} max`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {stats.total > 0 && <span>{stats.total} total RSVPs</span>}
                      </div>
                      <Link href={`/events/public/${event.id}`}>
                        <Button>{isUpcoming ? "View & RSVP" : "View Event"}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4 mt-12">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold font-serif">EventEase</span>
          </div>
          <p className="text-muted-foreground">Professional event management platform for modern organizations.</p>
        </div>
      </footer>
    </div>
  )
}
