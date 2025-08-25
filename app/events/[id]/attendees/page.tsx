"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  ArrowLeft,
  Download,
  Search,
  Filter,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { EventService, type Event } from "@/lib/events"
import { RSVPService, type RSVP } from "@/lib/rsvp"
import { ExportService } from "@/lib/export"

function AttendeeManagementContent() {
  const { user } = useAuth()
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [filteredRsvps, setFilteredRsvps] = useState<RSVP[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      loadEventAndAttendees(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    // Filter RSVPs based on search term and status
    let filtered = rsvps

    if (searchTerm) {
      filtered = filtered.filter(
        (rsvp) =>
          rsvp.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rsvp.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((rsvp) => rsvp.status === statusFilter)
    }

    setFilteredRsvps(filtered)
  }, [rsvps, searchTerm, statusFilter])

  const loadEventAndAttendees = async (eventId: string) => {
    try {
      setIsLoading(true)
      const [eventData, rsvpData] = await Promise.all([
        EventService.getEvent(eventId),
        RSVPService.getRSVPsForEvent(eventId),
      ])

      if (!eventData) {
        setError("Event not found")
        return
      }

      // Check if user can manage this event
      if (user && user.role !== "admin" && eventData.createdBy !== user.id) {
        setError("You don't have permission to manage attendees for this event")
        return
      }

      setEvent(eventData)
      setRsvps(rsvpData)
      setFilteredRsvps(rsvpData)

      // Generate report
      const reportData = ExportService.generateAttendeeReport(rsvpData, eventData)
      setReport(reportData)
    } catch (err) {
      setError("Failed to load event and attendees")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (rsvpId: string, newStatus: RSVP["status"]) => {
    try {
      await RSVPService.updateRSVPStatus(rsvpId, newStatus)
      setRsvps(rsvps.map((rsvp) => (rsvp.id === rsvpId ? { ...rsvp, status: newStatus } : rsvp)))
      setSuccess(`RSVP status updated to ${newStatus}`)

      // Update report
      if (event) {
        const updatedRsvps = rsvps.map((rsvp) => (rsvp.id === rsvpId ? { ...rsvp, status: newStatus } : rsvp))
        const reportData = ExportService.generateAttendeeReport(updatedRsvps, event)
        setReport(reportData)
      }
    } catch (err) {
      setError("Failed to update RSVP status")
    }
  }

  const handleDeleteRSVP = async (rsvpId: string) => {
    if (!confirm("Are you sure you want to delete this RSVP?")) return

    try {
      await RSVPService.deleteRSVP(rsvpId)
      const updatedRsvps = rsvps.filter((rsvp) => rsvp.id !== rsvpId)
      setRsvps(updatedRsvps)
      setSuccess("RSVP deleted successfully")

      // Update report
      if (event) {
        const reportData = ExportService.generateAttendeeReport(updatedRsvps, event)
        setReport(reportData)
      }
    } catch (err) {
      setError("Failed to delete RSVP")
    }
  }

  const handleExportCSV = () => {
    if (!event) return
    ExportService.downloadCSV(filteredRsvps, event)
    setSuccess("Attendee list exported successfully")
  }

  const getStatusIcon = (status: RSVP["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "declined":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadgeColor = (status: RSVP["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-serif text-foreground">Attendee Management</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif">Attendee Report</DialogTitle>
                  <DialogDescription>Detailed analytics for {event.title}</DialogDescription>
                </DialogHeader>
                {report && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{report.stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total RSVPs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{report.stats.confirmed}</div>
                        <div className="text-sm text-muted-foreground">Confirmed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{report.stats.pending}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{report.stats.declined}</div>
                        <div className="text-sm text-muted-foreground">Declined</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Confirmation Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{report.confirmationRate}%</div>
                          <div className="text-sm text-muted-foreground">
                            {report.stats.confirmed} of {report.stats.total} RSVPs confirmed
                          </div>
                        </CardContent>
                      </Card>

                      {event.maxAttendees && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Capacity Used</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{report.capacityUsed}%</div>
                            <div className="text-sm text-muted-foreground">
                              {report.stats.confirmed} of {event.maxAttendees} max capacity
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Recent RSVPs</h4>
                      <div className="space-y-2">
                        {report.recentRSVPs.map((rsvp: RSVP) => (
                          <div key={rsvp.id} className="flex items-center justify-between text-sm">
                            <span>{rsvp.attendeeName}</span>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusBadgeColor(rsvp.status)}>{rsvp.status}</Badge>
                              <span className="text-muted-foreground">{formatDate(rsvp.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Button onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-2">{event.title}</h2>
          <p className="text-muted-foreground">Manage attendees and RSVPs for this event</p>
        </div>

        {/* Stats Overview */}
        {report && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{report.stats.total}</div>
                <div className="text-sm text-muted-foreground">Total RSVPs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{report.stats.confirmed}</div>
                <div className="text-sm text-muted-foreground">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{report.stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{report.stats.declined}</div>
                <div className="text-sm text-muted-foreground">Declined</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Attendees List */}
        <div className="space-y-4">
          {filteredRsvps.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold font-serif mb-2">
                  {searchTerm || statusFilter !== "all" ? "No attendees found" : "No RSVPs yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Attendees will appear here once they RSVP for your event"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRsvps.map((rsvp) => (
              <Card key={rsvp.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {rsvp.attendeeName
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold font-serif">{rsvp.attendeeName}</h3>
                        <p className="text-sm text-muted-foreground">{rsvp.attendeeEmail}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusBadgeColor(rsvp.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(rsvp.status)}
                              <span>{rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}</span>
                            </span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">RSVP'd {formatDate(rsvp.createdAt)}</span>
                        </div>
                        {rsvp.notes && <p className="text-sm text-muted-foreground mt-1 italic">"{rsvp.notes}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={rsvp.status}
                        onValueChange={(value: RSVP["status"]) => handleStatusChange(rsvp.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${rsvp.attendeeEmail}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRSVP(rsvp.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default function AttendeeManagementPage() {
  return (
    <ProtectedRoute>
      <AttendeeManagementContent />
    </ProtectedRoute>
  )
}
