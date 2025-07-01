"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { scanQRCode, markRedemptionAsUsed } from "@/lib/actions/admin"
import { QrCode, Search, CheckCircle, User, Gift } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface QRScanResult {
  id: string
  qrCode: string
  status: string
  pointsUsed: number
  qrCodeExpiry: Date | null
  usedAt: Date | null
  customer: {
    user: {
      name: string
      email: string
    }
  }
  program: {
    name: string
    description: string
    thumbnail: string | null
  }
}

export function QRScanner() {
  const [qrCode, setQrCode] = useState("")
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const { toast } = useToast()

  async function handleScan() {
    if (!qrCode.trim()) {
      toast({
        title: "QR Code kosong",
        description: "Masukkan kode QR untuk discan.",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    try {
      const result = await scanQRCode(qrCode.trim())
      if (result.success) {
        setScanResult(result.data)
        if (result.data.status === "USED") {
          toast({
            title: "QR Code sudah digunakan",
            description: "QR Code ini sudah pernah digunakan sebelumnya.",
            variant: "destructive",
          })
        } else if (result.data.status === "APPROVED") {
          toast({
            title: "QR Code valid!",
            description: "QR Code ditemukan dan siap digunakan.",
          })
        }
      } else {
        toast({
          title: "QR Code tidak valid",
          description: result.error,
          variant: "destructive",
        })
        setScanResult(null)
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti.",
        variant: "destructive",
      })
      setScanResult(null)
    } finally {
      setIsScanning(false)
    }
  }

  async function handleMarkAsUsed() {
    if (!scanResult) return

    setIsMarking(true)
    try {
      const result = await markRedemptionAsUsed(scanResult.id)
      if (result.success) {
        toast({
          title: "Berhasil!",
          description: "Hadiah telah berhasil diklaim oleh customer.",
        })
        setScanResult({ ...scanResult, status: "USED", usedAt: new Date() })
      } else {
        toast({
          title: "Gagal menandai sebagai digunakan",
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
      setIsMarking(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-600">
            Siap Digunakan
          </Badge>
        )
      case "USED":
        return <Badge variant="outline">Sudah Digunakan</Badge>
      case "PENDING":
        return <Badge variant="secondary">Menunggu Persetujuan</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExpired = (expiry: Date | null) => {
    if (!expiry) return false
    return new Date() > new Date(expiry)
  }

  return (
    <div className="space-y-6">
      {/* QR Scanner Input */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Scan QR Code Customer</h3>
              <p className="text-gray-600">Masukkan kode QR untuk verifikasi penukaran hadiah</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="qrCode">Kode QR</Label>
                <Input
                  id="qrCode"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Masukkan atau scan QR code..."
                  onKeyPress={(e) => e.key === "Enter" && handleScan()}
                />
              </div>

              <Button onClick={handleScan} disabled={isScanning} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                {isScanning ? "Memindai..." : "Scan QR Code"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Result */}
      {scanResult && (
        <Card
          className={`border-l-4 ${
            scanResult.status === "APPROVED"
              ? "border-l-green-400"
              : scanResult.status === "USED"
                ? "border-l-gray-400"
                : "border-l-red-400"
          }`}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-medium text-lg">Hasil Scan QR Code</h3>
                    {getStatusBadge(scanResult.status)}
                  </div>
                  <p className="text-sm text-gray-600">QR Code: {scanResult.qrCode}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <User className="w-8 h-8 text-gray-400" />
                  <div>
                    <h4 className="font-medium">{scanResult.customer.user.name}</h4>
                    <p className="text-sm text-gray-600">{scanResult.customer.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Program Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-4">
                  {scanResult.program.thumbnail ? (
                    <img
                      src={scanResult.program.thumbnail || "/placeholder.svg"}
                      alt={scanResult.program.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <Gift className="w-16 h-16 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{scanResult.program.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{scanResult.program.description}</p>
                    <p className="text-sm text-gray-600 mt-2">Poin digunakan: {scanResult.pointsUsed}</p>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {scanResult.qrCodeExpiry && (
                  <div>
                    <p className="font-medium text-gray-900">Berlaku hingga:</p>
                    <p className={`${isExpired(scanResult.qrCodeExpiry) ? "text-red-600" : "text-gray-600"}`}>
                      {formatDate(scanResult.qrCodeExpiry)}
                      {isExpired(scanResult.qrCodeExpiry) && " (Expired)"}
                    </p>
                  </div>
                )}
                {scanResult.usedAt && (
                  <div>
                    <p className="font-medium text-gray-900">Digunakan pada:</p>
                    <p className="text-gray-600">{formatDate(scanResult.usedAt)}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {scanResult.status === "APPROVED" && !isExpired(scanResult.qrCodeExpiry) && (
                <div className="pt-4 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tandai Sebagai Digunakan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Konfirmasi Penggunaan Hadiah</DialogTitle>
                        <DialogDescription>Apakah Anda yakin customer telah mengambil hadiah ini?</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Customer:</span>
                            <span className="font-medium">{scanResult.customer.user.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hadiah:</span>
                            <span className="font-medium">{scanResult.program.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Poin digunakan:</span>
                            <span className="font-medium">{scanResult.pointsUsed}</span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleMarkAsUsed} disabled={isMarking}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isMarking ? "Memproses..." : "Konfirmasi"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Warning Messages */}
              {scanResult.status === "USED" && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    ⚠️ QR Code ini sudah pernah digunakan pada {scanResult.usedAt && formatDate(scanResult.usedAt)}
                  </p>
                </div>
              )}

              {scanResult.qrCodeExpiry && isExpired(scanResult.qrCodeExpiry) && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">⚠️ QR Code ini sudah expired dan tidak dapat digunakan</p>
                </div>
              )}

              {scanResult.status === "PENDING" && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600">⚠️ Penukaran ini masih menunggu persetujuan admin</p>
                </div>
              )}

              {scanResult.status === "REJECTED" && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">⚠️ Penukaran ini telah ditolak dan tidak dapat digunakan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
