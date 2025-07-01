"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getPendingUploads, verifyPaymentUpload } from "@/lib/actions/admin"
import type { PaymentUploadWithDetails } from "@/lib/types"
import { Calendar, Clock, Users, Eye, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function VerifyUploadList() {
  const [uploads, setUploads] = useState<PaymentUploadWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUploads()
  }, [])

  async function fetchUploads() {
    try {
      const result = await getPendingUploads()
      if (result.success) {
        setUploads(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching uploads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerify(uploadId: string, action: "approve" | "reject", formData: FormData) {
    setProcessingId(uploadId)
    try {
      const result = await verifyPaymentUpload(uploadId, action, formData)
      if (result.success) {
        toast({
          title: action === "approve" ? "Upload disetujui!" : "Upload ditolak",
          description:
            action === "approve" ? "Poin telah ditambahkan ke customer" : "Upload telah ditolak dengan catatan",
        })
        fetchUploads() // Refresh data
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
    })
  }

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString("id-ID", {
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

  if (uploads.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Semua upload sudah diverifikasi</h3>
        <p className="mt-2 text-gray-600">Tidak ada upload yang menunggu verifikasi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {uploads.map((upload) => (
        <Card key={upload.id} className="border-l-4 border-l-yellow-400">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-medium text-lg">{upload.customer.user.name}</h3>
                    <Badge variant="secondary">Menunggu Verifikasi</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(upload.bookingDate.toString())}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(upload.startTime.toString())} - {formatTime(upload.endTime.toString())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{upload.bookingParticipants.length} peserta</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Durasi: {upload.durationHours} jam</p>
                  {upload.totalAmount && (
                    <p className="text-sm text-gray-600">
                      Total: Rp {Number(upload.totalAmount).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Peserta:</p>
                <div className="grid grid-cols-2 gap-2">
                  {upload.bookingParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between text-sm">
                      <span>{participant.customerName}</span>
                      <Badge variant={participant.customerProfile ? "default" : "outline"} className="text-xs">
                        {participant.customerProfile ? "Terdaftar" : "Tidak terdaftar"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proof */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Bukti Pembayaran:</p>
                <img
                  src={upload.paymentProof || "/placeholder.svg"}
                  alt="Bukti pembayaran"
                  className="w-full max-w-md rounded-lg border cursor-pointer"
                  onClick={() => window.open(upload.paymentProof, "_blank")}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" disabled={processingId === upload.id}>
                      <Check className="w-4 h-4 mr-2" />
                      Setujui
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Setujui Upload Pembayaran</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        handleVerify(upload.id, "approve", formData)
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="pointsPerHour">Poin per Jam</Label>
                        <Input
                          id="pointsPerHour"
                          name="pointsPerHour"
                          type="number"
                          defaultValue="10"
                          min="1"
                          required
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Total poin yang akan diberikan: {upload.durationHours} jam × poin per jam
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="adminNotes">Catatan (Opsional)</Label>
                        <Textarea id="adminNotes" name="adminNotes" placeholder="Catatan untuk customer..." rows={3} />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="submit" disabled={processingId === upload.id}>
                          {processingId === upload.id ? "Memproses..." : "Setujui"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={processingId === upload.id}>
                      <X className="w-4 h-4 mr-2" />
                      Tolak
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tolak Upload Pembayaran</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        handleVerify(upload.id, "reject", formData)
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
                        <Button type="submit" variant="destructive" disabled={processingId === upload.id}>
                          {processingId === upload.id ? "Memproses..." : "Tolak"}
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
                      <DialogTitle>Detail Upload Pembayaran</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Customer</p>
                          <p className="text-sm text-gray-600">{upload.customer.user.name}</p>
                          <p className="text-sm text-gray-600">{upload.customer.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Tanggal Upload</p>
                          <p className="text-sm text-gray-600">{formatDate(upload.createdAt.toString())}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Bukti Pembayaran</p>
                        <img
                          src={upload.paymentProof || "/placeholder.svg"}
                          alt="Bukti pembayaran"
                          className="w-full rounded-lg border"
                        />
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
