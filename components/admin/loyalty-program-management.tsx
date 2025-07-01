"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  getLoyaltyPrograms,
  createLoyaltyProgram,
  updateLoyaltyProgram,
  deleteLoyaltyProgram,
  toggleProgramStatus,
} from "@/lib/actions/admin"
import type { LoyaltyProgram } from "@prisma/client"
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Star, Gift } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export function LoyaltyProgramManagement() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPrograms()
  }, [])

  async function fetchPrograms() {
    try {
      const result = await getLoyaltyPrograms()
      if (result.success) {
        setPrograms(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching programs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  async function handleCreateProgram(formData: FormData) {
    setIsCreating(true)
    try {
      if (selectedFile) {
        formData.append("thumbnail", selectedFile)
      }

      const result = await createLoyaltyProgram(formData)
      if (result.success) {
        toast({
          title: "Program berhasil dibuat!",
          description: "Program loyalty baru telah ditambahkan.",
        })
        fetchPrograms()
        setIsCreating(false)
        setSelectedFile(null)
        setPreviewUrl(null)
      } else {
        toast({
          title: "Gagal membuat program",
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

  async function handleUpdateProgram(formData: FormData) {
    if (!editingProgram) return

    setProcessingId(editingProgram.id)
    try {
      if (selectedFile) {
        formData.append("thumbnail", selectedFile)
      }

      const result = await updateLoyaltyProgram(editingProgram.id, formData)
      if (result.success) {
        toast({
          title: "Program berhasil diupdate!",
          description: "Program loyalty telah diperbarui.",
        })
        fetchPrograms()
        setEditingProgram(null)
        setSelectedFile(null)
        setPreviewUrl(null)
      } else {
        toast({
          title: "Gagal mengupdate program",
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

  async function handleDeleteProgram(programId: string) {
    setProcessingId(programId)
    try {
      const result = await deleteLoyaltyProgram(programId)
      if (result.success) {
        toast({
          title: "Program berhasil dihapus!",
          description: "Program loyalty telah dihapus dari sistem.",
        })
        fetchPrograms()
      } else {
        toast({
          title: "Gagal menghapus program",
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

  async function handleToggleStatus(programId: string) {
    setProcessingId(programId)
    try {
      const result = await toggleProgramStatus(programId)
      if (result.success) {
        toast({
          title: "Status program berhasil diubah!",
          description: "Status aktif program telah diperbarui.",
        })
        fetchPrograms()
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

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Program Button */}
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Program Loyalty</DialogTitle>
              <DialogDescription>Buat program loyalty baru untuk customer</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleCreateProgram(formData)
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Nama Program</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea id="description" name="description" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requiredPoints">Poin Dibutuhkan</Label>
                  <Input id="requiredPoints" name="requiredPoints" type="number" min="1" required />
                </div>
                <div>
                  <Label htmlFor="maxRedemptions">Maksimal Penukaran (Opsional)</Label>
                  <Input id="maxRedemptions" name="maxRedemptions" type="number" min="1" />
                  <p className="text-xs text-gray-600 mt-1">Kosongkan untuk unlimited</p>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <Label>Thumbnail Program</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <Label htmlFor="thumbnail" className="cursor-pointer">
                        <span className="text-sm font-medium text-gray-900">Upload gambar</span>
                        <span className="text-sm text-gray-600 block">PNG, JPG, JPEG hingga 5MB</span>
                      </Label>
                      <Input
                        id="thumbnail"
                        name="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Membuat..." : "Buat Program"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Programs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <Card key={program.id} className={`relative ${!program.isActive ? "opacity-75" : ""}`}>
            {program.thumbnail && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={program.thumbnail || "/placeholder.svg"}
                  alt={program.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-lg">{program.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>{program.requiredPoints}</span>
                  </Badge>
                  <Badge variant={program.isActive ? "default" : "secondary"}>
                    {program.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>

              <p className="text-gray-600 text-sm">{program.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {program.maxRedemptions
                    ? `${program.maxRedemptions - program.currentRedemptions} tersisa`
                    : "Unlimited"}
                </span>
                <span>{program.currentRedemptions} ditukar</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(program.id)}
                  disabled={processingId === program.id}
                >
                  {program.isActive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {program.isActive ? "Nonaktifkan" : "Aktifkan"}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProgram(program)
                        setPreviewUrl(program.thumbnail)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Program Loyalty</DialogTitle>
                      <DialogDescription>Update program loyalty</DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        handleUpdateProgram(formData)
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="editName">Nama Program</Label>
                        <Input id="editName" name="name" defaultValue={program.name} required />
                      </div>
                      <div>
                        <Label htmlFor="editDescription">Deskripsi</Label>
                        <Textarea
                          id="editDescription"
                          name="description"
                          rows={3}
                          defaultValue={program.description}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editRequiredPoints">Poin Dibutuhkan</Label>
                          <Input
                            id="editRequiredPoints"
                            name="requiredPoints"
                            type="number"
                            min="1"
                            defaultValue={program.requiredPoints}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="editMaxRedemptions">Maksimal Penukaran</Label>
                          <Input
                            id="editMaxRedemptions"
                            name="maxRedemptions"
                            type="number"
                            min="1"
                            defaultValue={program.maxRedemptions || ""}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Thumbnail Program</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="mt-2">
                              <Label htmlFor="editThumbnail" className="cursor-pointer">
                                <span className="text-sm font-medium text-gray-900">Upload gambar baru</span>
                                <span className="text-sm text-gray-600 block">PNG, JPG, JPEG hingga 5MB</span>
                              </Label>
                              <Input
                                id="editThumbnail"
                                name="thumbnail"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>

                        {previewUrl && (
                          <div className="mt-4">
                            <img
                              src={previewUrl || "/placeholder.svg"}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button type="submit" disabled={processingId === program.id}>
                          {processingId === program.id ? "Mengupdate..." : "Update Program"}
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
                      <AlertDialogTitle>Hapus Program</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus program "{program.name}"? Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteProgram(program.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center py-12">
          <Gift className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada program</h3>
          <p className="mt-2 text-gray-600">Tambahkan program loyalty pertama untuk customer.</p>
        </div>
      )}
    </div>
  )
}
