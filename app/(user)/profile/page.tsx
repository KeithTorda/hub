"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { User, Mail, Building2, Shield, Loader2, Pencil, Save, X, Lock } from "lucide-react"
import { useEffect, useState } from "react"
import { Id } from "@/convex/_generated/dataModel"
import { showSuccess, showError } from "@/lib/swal"

export default function ProfilePage() {
    // TODO: Replace with actual auth user ID when auth is implemented
    // For now, we'll try to find a user or show a placeholder
    const [user, setUser] = useState<any>(null)
    const [userId, setUserId] = useState<Id<"users"> | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        password: "",
        confirmPassword: ""
    })

    const updateUser = useMutation(api.mutations.updateUser)

    // Fetch user data if we have an ID
    const userData = useQuery(api.queries.getUser, userId ? { id: userId } : "skip")

    useEffect(() => {
        const stored = localStorage.getItem("knowledgehub_user")
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                if (parsed._id) {
                    setUserId(parsed._id)
                }
            } catch (e) {
                console.error("Failed to parse user session", e)
            }
        }
    }, [])

    // Update local state when query returns
    useEffect(() => {
        if (userData) {
            setUser(userData)
            setFormData(prev => ({
                ...prev,
                name: userData.name,
                email: userData.email,
                department: userData.department,
            }))
        }
    }, [userData])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return

        if (formData.password && formData.password !== formData.confirmPassword) {
            showError("Password Mismatch", "New password and confirmation do not match.")
            return
        }

        setIsSaving(true)
        try {
            const updates: any = {
                id: userId,
                name: formData.name,
                email: formData.email,
                department: formData.department,
            }

            if (formData.password) {
                updates.password = formData.password
            }

            await updateUser(updates)

            // Update local storage to reflect changes immediately in header
            const updatedUser = { ...user, ...updates }
            localStorage.setItem("knowledgehub_user", JSON.stringify(updatedUser))

            // Force a window dispatch event so header listens (optional, or just reload)
            // For now, simple state update is enough for this page, header might need refresh
            // But we can manually dispatch a storage event if needed. 
            // Actually, simpler to just trigger a custom event or let the user navigate.

            showSuccess("Profile Updated", "Your information has been saved successfully.")
            setIsEditing(false)
            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" })) // Clear password fields
        } catch (err) {
            showError("Update Failed", "Could not save user details. Please try again.")
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                department: user.department,
                password: "",
                confirmPassword: ""
            })
        }
    }

    if (!user) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background p-6">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
                    <div>
                        <h1 className="text-2xl font-black text-foreground">My Profile</h1>
                        <p className="text-sm text-muted-foreground">Manage your account information</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-8">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-8">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                            {user.name.charAt(0)}
                        </div>

                        <div className="mt-6 flex-1 space-y-6 sm:mt-0">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium uppercase text-muted-foreground">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{user.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium uppercase text-muted-foreground">Email Address</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{user.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium uppercase text-muted-foreground">Department</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="e.g., IT Department"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{user.department}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium uppercase text-muted-foreground">Account Role</label>
                                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            {user.role.toUpperCase()}
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${user.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                                                }`}>
                                                {user.status}
                                            </span>
                                        </span>
                                    </div>
                                    {isEditing && <p className="text-[10px] text-muted-foreground">Role and status cannot be edited.</p>}
                                </div>
                            </div>

                            {/* Password Change Section - Only visible in edit mode */}
                            {isEditing && (
                                <div className="rounded-lg border border-dashed border-border p-4 bg-muted/20">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold text-foreground">Change Password</h3>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">New Password</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Leave blank to keep current"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
