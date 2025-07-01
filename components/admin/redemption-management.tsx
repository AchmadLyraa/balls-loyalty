"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getPendingRedemptions, verifyRedemption } from "@/lib/actions/admin"
import type { RedemptionWithDetails } from "@/lib/types"
import { Calendar, Gift, User, Check, X, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function RedemptionManagement() {
  const [redemptions, setRedemptions] = useState<RedemptionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  const [openDialogs, setOpenDialogs] = useState<
    Record<string, { approve: boolean; reject: boolean; detail: boolean }>
  >({})

  const setDialogOpen = (redemptionId: string, type: "approve" | "reject" | "detail", open: boolean) => {
    setOpenDialogs((prev) => ({
      ...prev,
      [redemptionId]: {
        ...prev[redemptionId],
        [type]: open,
      },
    }))
  }

  useEffect(() => {
    fetchRedemptions()
  }, [])

  async function fetchRedemptions() {
    try {
      const result = await getPendingRedemptions()
      if (result.success) {
        setRedemptions(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching redemptions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerify(redemptionId: string, action: "approve" | "reject", formData: FormData) {
    setProcessingId(redemptionId)
    try {
      const result = await verifyRedemption(redemptionId, action, formData)
      if (result.success) {
        toast({
          title: action === "approve" ? "Penukaran disetujui!" : "Penukaran ditolak",
          description:
            action === "approve" ? "QR code telah dibuat untuk customer" : "Penukaran telah ditolak dengan catatan",
        })
        // Immediately remove the processed redemption from the list
        setRedemptions((prev) => prev.filter((r) => r.id !== redemptionId))
      } else {
        toast({
          title: "Gagal memproses",
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
      hour: "2-digit",
      minute: "2-digit",
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

  if (redemptions.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Semua penukaran sudah diverifikasi</h3>
        <p className="mt-2 text-gray-600">Tidak ada penukaran yang menunggu persetujuan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {redemptions.map((redemption) => (
        <Card key={redemption.id} className="border-l-4 border-l-orange-400">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-medium text-lg">{redemption.customer.user.name}</h3>
                    <Badge variant="secondary">Menunggu Persetujuan</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{redemption.customer.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(redemption.createdAt.toString())}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Poin digunakan: {redemption.pointsUsed}</p>
                  <p className="text-xs text-gray-500">ID: {redemption.qrCode}</p>
                </div>
              </div>

              {/* Program Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-4">
                  {redemption.program.thumbnail && (
                    <img
                      src={redemption.program.thumbnail || "/placeholder.svg"}
                      alt={redemption.program.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{redemption.program.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{redemption.program.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="flex items-center space-x-1">
                        <Gift className="w-4 h-4" />
                        <span>{redemption.program.requiredPoints} poin</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Dialog
                  open={openDialogs[redemption.id]?.approve || false}
                  onOpenChange={(open) => setDialogOpen(redemption.id, "approve", open)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      disabled={processingId === redemption.id}
                      onClick={() => setDialogOpen(redemption.id, "approve", true)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Setujui
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Setujui Penukaran Hadiah</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        await handleVerify(redemption.id, "approve", formData)
                        setDialogOpen(redemption.id, "approve", false) // Close dialog after processing
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Customer:</strong> {redemption.customer.user.name}
                        </p>
                        <p className="text-sm">
                          <strong>Hadiah:</strong> {redemption.program.name}
                        </p>
                        <p className="text-sm">
                          <strong>Poin:</strong> {redemption.pointsUsed}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="adminNotes">Catatan (Opsional)</Label>
                        <Textarea id="adminNotes" name="adminNotes" placeholder="Catatan untuk customer..." rows={3} />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="submit" disabled={processingId === redemption.id}>
                          {processingId === redemption.id ? "Memproses..." : "Setujui"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={openDialogs[redemption.id]?.reject || false}
                  onOpenChange={(open) => setDialogOpen(redemption.id, "reject", open)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={processingId === redemption.id}
                      onClick={() => setDialogOpen(redemption.id, "reject", true)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Tolak
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tolak Penukaran Hadiah</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        await handleVerify(redemption.id, "reject", formData)
                        setDialogOpen(redemption.id, "reject", false) // Close dialog after processing
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="adminNotes">Alasan Penolakan</Label>
                        <Textarea
                          id="adminNotes"
                          name="adminNotes"
                          placeholder="Jelaskan alasan penolakan..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="submit" variant="destructive" disabled={processingId === redemption.id}>
                          {processingId === redemption.id ? "Memproses..." : "Tolak"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Detail Penukaran Hadiah</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Customer</p>
                          <p className="text-sm text-gray-600">{redemption.customer.user.name}</p>
                          <p className="text-sm text-gray-600">{redemption.customer.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Tanggal Penukaran</p>
                          <p className="text-sm text-gray-600">{formatDate(redemption.createdAt.toString())}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Detail Hadiah</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-4">
                            {redemption.program.thumbnail && (
                              <img
                                src={redemption.program.thumbnail || "/placeholder.svg"}
                                alt={redemption.program.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h4 className="font-medium">{redemption.program.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{redemption.program.description}</p>
                              <p className="text-sm text-gray-600 mt-2">
                                Poin dibutuhkan: {redemption.program.requiredPoints}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

