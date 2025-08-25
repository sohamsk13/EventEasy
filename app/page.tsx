import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card glassmorphism">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold font-serif text-foreground neon-text">EventEase</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" className="cyber-button glow-border bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="cyber-button">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 fade-in-up">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl font-bold font-serif text-foreground mb-6 neon-text">
            Professional Event Management Made Simple
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Streamline your event planning process with EventEase. Create, manage, and track events with powerful tools
            designed for administrators, staff, and event owners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-3 cyber-button">
                Start Planning Events
              </Button>
            </Link>
            <Link href="/events/public">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent cyber-button glow-border">
                Browse Public Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold font-serif text-center text-foreground mb-12 neon-text">
            Everything You Need for Successful Events
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border glow-border glassmorphism fade-in-up">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4 animate-pulse" />
                <CardTitle className="font-serif">Event Management</CardTitle>
                <CardDescription>
                  Create and manage events with detailed scheduling, location tracking, and attendee limits.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border glow-border glassmorphism fade-in-up">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4 animate-pulse" />
                <CardTitle className="font-serif">RSVP System</CardTitle>
                <CardDescription>
                  Streamlined RSVP process for attendees with real-time tracking and confirmation management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border glow-border glassmorphism fade-in-up">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4 animate-pulse" />
                <CardTitle className="font-serif">Role-Based Access</CardTitle>
                <CardDescription>
                  Secure role-based permissions for administrators, staff members, and event owners.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border glow-border glassmorphism fade-in-up">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4 animate-pulse" />
                <CardTitle className="font-serif">Real-Time Updates</CardTitle>
                <CardDescription>Live updates on event status, attendee counts, and staff assignments.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border glow-border glassmorphism fade-in-up">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4 animate-pulse" />
                <CardTitle className="font-serif">Public Events</CardTitle>
                <CardDescription>
                  Showcase public events with beautiful event pages and easy RSVP functionality.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border glow-border glassmorphism fade-in-up">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4 animate-pulse" />
                <CardTitle className="font-serif">Attendee Management</CardTitle>
                <CardDescription>
                  Comprehensive attendee tracking with export capabilities and communication tools.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 fade-in-up">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold font-serif text-foreground mb-6 neon-text">
            Ready to Transform Your Event Management?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of event organizers who trust EventEase for their professional event management needs.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8 py-3 cyber-button">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4 glassmorphism">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-lg font-bold font-serif neon-text">EventEase</span>
          </div>
          <p className="text-muted-foreground">Professional event management platform for modern organizations.</p>
        </div>
      </footer>
    </div>
  )
}
