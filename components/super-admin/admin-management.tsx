"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminStatus,
} from "@/lib/actions/super-admin"
import type { User } from "@prisma/client"
import { Plus, Edit, Trash2, Eye, EyeOff, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users } from "lucide-react" // Import Users component

export function AdminManagement() {
  const [admins, setAdmins] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    try {
      const result = await getAdminUsers()
      if (result.success) {
        setAdmins(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching admins:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateAdmin(formData: FormData) {
    setIsCreating(true)
    try {
      const result = await createAdminUser(formData)
      if (result.success) {
        toast({
          title: "Admin berhasil dibuat!",
          description: "Admin baru telah ditambahkan ke sistem.",
        })
        fetchAdmins()
        setIsCreating(false)
      } else {
        toast({
          title: "Gagal membuat admin",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  async function handleUpdateAdmin(formData: FormData) {
    if (!editingAdmin) return

    setProcessingId(editingAdmin.id)
    try {
      const result = await updateAdminUser(editingAdmin.id, formData)
      if (result.success) {
        toast({
          title: "Admin berhasil diupdate!",
          description: "Data admin telah diperbarui.",
        })
        fetchAdmins()
        setEditingAdmin(null)
      } else {
        toast({
          title: "Gagal mengupdate admin",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDeleteAdmin(adminId: string) {
    setProcessingId(adminId)
    try {
      const result = await deleteAdminUser(adminId)
      if (result.success) {
        toast({
          title: "Admin berhasil dihapus!",
          description: "Admin telah dihapus dari sistem.",
        })
        fetchAdmins()
      } else {
        toast({
          title: "Gagal menghapus admin",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleToggleStatus(adminId: string) {
    setProcessingId(adminId)
    try {
      const result = await toggleAdminStatus(adminId)
      if (result.success) {
        toast({
          title: "Status admin berhasil diubah!",
          description: "Status aktif admin telah diperbarui.",
        })
        fetchAdmins()
      } else {
        toast({
          title: "Gagal mengubah status",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Admin Button */}
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Admin Baru</DialogTitle>
              <DialogDescription>Buat akun admin baru untuk sistem</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleCreateAdmin(formData)
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="ADMIN">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" minLength={6} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isCreating ? "Membuat..." : "Buat Admin"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin List */}
      <div className="space-y-4">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-medium text-lg">{admin.name}</h3>
                    <Badge variant={admin.role === "SUPER_ADMIN" ? "destructive" : "default"}>
                      {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                    </Badge>
                    <Badge variant={admin.isActive ? "default" : "secondary"}>
                      {admin.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{admin.email}</p>
                    {admin.phone && <p>{admin.phone}</p>}
                    <p>Dibuat: {formatDate(admin.createdAt.toString())}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(admin.id)}
                    disabled={processingId === admin.id}
                  >
                    {admin.isActive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {admin.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingAdmin(admin)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Admin</DialogTitle>
                        <DialogDescription>Update data admin</DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          handleUpdateAdmin(formData)
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="editName">Nama Lengkap</Label>
                          <Input id="editName" name="name" defaultValue={admin.name} required />
                        </div>
                        <div>
                          <Label htmlFor="editEmail">Email</Label>
                          <Input id="editEmail" name="email" type="email" defaultValue={admin.email} required />
                        </div>
                        <div>
                          <Label htmlFor="editPhone">Nomor Telepon</Label>
                          <Input id="editPhone" name="phone" type="tel" defaultValue={admin.phone || ""} />
                        </div>
                        <div>
                          <Label htmlFor="editRole">Role</Label>
                          <Select name="role" defaultValue={admin.role}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="editPassword">Password Baru (Kosongkan jika tidak diubah)</Label>
                          <Input id="editPassword" name="password" type="password" minLength={6} />
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={processingId === admin.id}>
                            {processingId === admin.id ? "Mengupdate..." : "Update Admin"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Admin</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus admin {admin.name}? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {admins.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada admin</h3>
          <p className="mt-2 text-gray-600">Tambahkan admin pertama untuk mengelola sistem.</p>
        </div>
      )}
    </div>
  )
}
