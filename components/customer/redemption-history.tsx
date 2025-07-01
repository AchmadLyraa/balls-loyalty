"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getRedemptionHistory } from "@/lib/actions/customer"
import type { RedemptionWithDetails } from "@/lib/types"
import { QrCode, Calendar, Gift, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function RedemptionHistory() {
  const [redemptions, setRedemptions] = useState<RedemptionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const result = await getRedemptionHistory()
        if (result.success) {
          setRedemptions(result.data || [])
        }
      } catch (error) {
        console.error("Error fetching redemption history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Menunggu Persetujuan</Badge>
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-600">
            Disetujui
          </Badge>
        )
      case "REJECTED":
        return <Badge variant="destructive">Ditolak</Badge>
      case "USED":
        return <Badge variant="outline">Sudah Digunakan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
        <Gift className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada penukaran</h3>
        <p className="mt-2 text-gray-600">Anda belum menukar hadiah apapun.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {redemptions.map((redemption) => (
        <Card key={redemption.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-4">
                  <h3 className="font-medium text-lg">{redemption.program.name}</h3>
                  {getStatusBadge(redemption.status)}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Gift className="w-4 h-4" />
                    <span>{redemption.pointsUsed} poin</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(redemption.createdAt.toString())}</span>
                  </div>
                </div>

                {redemption.adminNotes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Catatan Admin:</p>
                    <p className="text-sm text-gray-600 mt-1">{redemption.adminNotes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {redemption.status === "APPROVED" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>QR Code Penukaran</DialogTitle>
                      </DialogHeader>
                      <div className="text-center space-y-4">
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                          <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">{redemption.program.name}</p>
                          <p className="text-sm text-gray-600">
                            Tunjukkan QR code ini kepada admin untuk mengklaim hadiah
                          </p>
                          <p className="text-xs text-gray-500">ID: {redemption.qrCode}</p>
                          {redemption.qrCodeExpiry && (
                            <p className="text-xs text-red-600">
                              Berlaku hingga: {formatDate(redemption.qrCodeExpiry.toString())}
                            </p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Detail Penukaran</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Hadiah</p>
                          <p className="text-sm text-gray-600">{redemption.program.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Poin Digunakan</p>
                          <p className="text-sm text-gray-600">{redemption.pointsUsed}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Status</p>
                          <div className="mt-1">{getStatusBadge(redemption.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Tanggal Penukaran</p>
                          <p className="text-sm text-gray-600">{formatDate(redemption.createdAt.toString())}</p>
                        </div>
                      </div>

                      {redemption.approvedAt && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Disetujui pada</p>
                          <p className="text-sm text-gray-600">{formatDate(redemption.approvedAt.toString())}</p>
                        </div>
                      )}

                      {redemption.usedAt && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Digunakan pada</p>
                          <p className="text-sm text-gray-600">{formatDate(redemption.usedAt.toString())}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-900">Deskripsi Hadiah</p>
                        <p className="text-sm text-gray-600">{redemption.program.description}</p>
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
