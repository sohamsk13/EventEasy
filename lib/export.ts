// Export utilities for attendee data
import type { RSVP } from "@/lib/rsvp"
import type { Event } from "@/lib/events"

export class ExportService {
  static generateCSV(rsvps: RSVP[], event: Event): string {
    const headers = ["Name", "Email", "Status", "Notes", "RSVP Date"]
    const rows = rsvps.map((rsvp) => [
      rsvp.attendeeName,
      rsvp.attendeeEmail,
      rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1),
      rsvp.notes || "",
      new Date(rsvp.createdAt).toLocaleDateString(),
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return csvContent
  }

  static downloadCSV(rsvps: RSVP[], event: Event): void {
    const csvContent = this.generateCSV(rsvps, event)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_attendees.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  static generateAttendeeReport(rsvps: RSVP[], event: Event) {
    const stats = {
      total: rsvps.length,
      confirmed: rsvps.filter((rsvp) => rsvp.status === "confirmed").length,
      pending: rsvps.filter((rsvp) => rsvp.status === "pending").length,
      declined: rsvps.filter((rsvp) => rsvp.status === "declined").length,
    }

    const confirmationRate = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0
    const capacityUsed = event.maxAttendees ? Math.round((stats.confirmed / event.maxAttendees) * 100) : 0

    return {
      stats,
      confirmationRate,
      capacityUsed,
      recentRSVPs: rsvps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    }
  }
}
