"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getSystemSettings, updateSystemSettings } from "@/lib/actions/admin"
import { Save, Settings } from "lucide-react"

export function PointsSettings() {
  const [settings, setSettings] = useState({
    defaultPointsPerHour: "10",
    maxQrExpiryHours: "24",
    minRedemptionPoints: "50",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const result = await getSystemSettings()
      if (result.success && result.data) {
        setSettings({
          defaultPointsPerHour: result.data.default_points_per_hour || "10",
          maxQrExpiryHours: result.data.max_qr_expiry_hours || "24",
          minRedemptionPoints: result.data.min_redemption_points || "50",
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await updateSystemSettings(settings)
      if (result.success) {
        toast({
          title: "Pengaturan disimpan!",
          description: "Pengaturan poin telah berhasil diperbarui.",
        })
      } else {
        toast({
          title: "Gagal menyimpan",
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
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Pengaturan Poin</span>
          </CardTitle>
          <CardDescription>Atur berapa poin yang diberikan untuk setiap jam booking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defaultPointsPerHour">Poin Default per Jam</Label>
            <Input
              id="defaultPointsPerHour"
              type="number"
              min="1"
              value={settings.defaultPointsPerHour}
              onChange={(e) => setSettings({ ...settings, defaultPointsPerHour: e.target.value })}
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Jumlah poin yang diberikan untuk setiap jam booking (akan dibagi rata ke semua peserta terdaftar)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Redemption</CardTitle>
          <CardDescription>Atur pengaturan terkait penukaran hadiah</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="minRedemptionPoints">Minimum Poin untuk Redemption</Label>
            <Input
              id="minRedemptionPoints"
              type="number"
              min="1"
              value={settings.minRedemptionPoints}
              onChange={(e) => setSettings({ ...settings, minRedemptionPoints: e.target.value })}
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Minimum poin yang harus dimiliki customer untuk bisa menukar hadiah
            </p>
          </div>

          <div>
            <Label htmlFor="maxQrExpiryHours">Masa Berlaku QR Code (Jam)</Label>
            <Input
              id="maxQrExpiryHours"
              type="number"
              min="1"
              value={settings.maxQrExpiryHours}
              onChange={(e) => setSettings({ ...settings, maxQrExpiryHours: e.target.value })}
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Berapa lama QR code berlaku setelah redemption disetujui (dalam jam)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>
    </form>
  )
}
