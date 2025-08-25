"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, ArrowLeft, UserPlus, Edit, Trash2, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { UserService, type UserWithStats, type CreateUserData } from "@/lib/users"
import type { User } from "@/lib/auth"

function UserManagementContent() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null)
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    firstName: "",
    lastName: "",
    role: "event_owner",
    password: "",
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const usersData = await UserService.getAllUsers()
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (err) {
      setError("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setIsSubmitting(true)
      const newUser = await UserService.createUser(formData)
      setUsers([...users, newUser])
      setSuccess("User created successfully")
      setShowCreateDialog(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setError("")
    setSuccess("")

    try {
      setIsSubmitting(true)
      const updatedUser = await UserService.updateUser(editingUser.id, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      })
      setUsers(users.map((user) => (user.id === editingUser.id ? updatedUser : user)))
      setSuccess("User updated successfully")
      setEditingUser(null)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("You cannot delete your own account")
      return
    }

    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await UserService.deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
      setSuccess("User deleted successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  const startEdit = (user: UserWithStats) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: "",
    })
  }

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "event_owner",
      password: "",
    })
  }

  const updateFormData = (field: keyof CreateUserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getRoleBadgeColor = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "staff":
        return "bg-blue-100 text-blue-800"
      case "event_owner":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Admin
            </Link>
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-serif text-foreground">User Management</h1>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">Create New User</DialogTitle>
                <DialogDescription>Add a new user to the system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: User["role"]) => updateFormData("role", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event_owner">Event Owner</SelectItem>
                      <SelectItem value="staff">Staff Member</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false)
                      resetForm()
                    }}
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Users</h2>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold font-serif">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                        {user.id === currentUser?.id && <Badge variant="outline">You</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-2">
                      <p>Events: {user.eventsCreated}</p>
                      <p>Joined: {formatDate(user.createdAt)}</p>
                      <p>Last login: {formatDate(user.lastLogin)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog
                        open={editingUser?.id === user.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingUser(null)
                            resetForm()
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => startEdit(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-serif">Edit User</DialogTitle>
                            <DialogDescription>Update user information and role</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="editFirstName">First Name</Label>
                                <Input
                                  id="editFirstName"
                                  value={formData.firstName}
                                  onChange={(e) => updateFormData("firstName", e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="editLastName">Last Name</Label>
                                <Input
                                  id="editLastName"
                                  value={formData.lastName}
                                  onChange={(e) => updateFormData("lastName", e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editEmail">Email</Label>
                              <Input
                                id="editEmail"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateFormData("email", e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editRole">Role</Label>
                              <Select
                                value={formData.role}
                                onValueChange={(value: User["role"]) => updateFormData("role", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="event_owner">Event Owner</SelectItem>
                                  <SelectItem value="staff">Staff Member</SelectItem>
                                  <SelectItem value="admin">Administrator</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update User
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditingUser(null)
                                  resetForm()
                                }}
                                className="bg-transparent"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold font-serif mb-2">No Users Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "No users in the system yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <UserManagementContent />
    </ProtectedRoute>
  )
}
