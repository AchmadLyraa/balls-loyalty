"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPaymentHistory } from "@/lib/actions/customer"
import type { PaymentUploadWithDetails } from "@/lib/types"
import { Calendar, Clock, Users, FileText, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentUploadWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const result = await getPaymentHistory()
        if (result.success) {
          setPayments(result.data || [])
        }
      } catch (error) {
        console.error("Error fetching payment history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Menunggu Verifikasi</Badge>
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-600">
            Disetujui
          </Badge>
        )
      case "REJECTED":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada upload</h3>
        <p className="mt-2 text-gray-600">Anda belum mengupload bukti pembayaran apapun.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(payment.bookingDate.toString())}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(payment.startTime.toString())} - {formatTime(payment.endTime.toString())}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{payment.bookingParticipants.length} peserta</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {getStatusBadge(payment.status)}
                  <span className="text-sm text-gray-600">Diupload {formatDate(payment.createdAt.toString())}</span>
                </div>

                {payment.adminNotes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Catatan Admin:</p>
                    <p className="text-sm text-gray-600 mt-1">{payment.adminNotes}</p>
                  </div>
                )}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
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
                        <p className="text-sm font-medium text-gray-900">Tanggal Booking</p>
                        <p className="text-sm text-gray-600">{formatDate(payment.bookingDate.toString())}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Waktu</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(payment.startTime.toString())} - {formatTime(payment.endTime.toString())}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Durasi</p>
                        <p className="text-sm text-gray-600">{payment.durationHours} jam</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Total Pembayaran</p>
                        <p className="text-sm text-gray-600">
                          {payment.totalAmount ? `Rp ${Number(payment.totalAmount).toLocaleString("id-ID")}` : "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Peserta</p>
                      <div className="space-y-1">
                        {payment.bookingParticipants.map((participant, index) => (
                          <div key={participant.id} className="flex items-center justify-between text-sm">
                            <span>{participant.customerName}</span>
                            <Badge variant="outline" className="text-xs">
                              {participant.customerProfile ? "Terdaftar" : "Tidak terdaftar"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Bukti Pembayaran</p>
                      <img
                        src={payment.paymentProof || "/placeholder.svg"}
                        alt="Bukti pembayaran"
                        className="w-full max-w-md rounded-lg border"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
