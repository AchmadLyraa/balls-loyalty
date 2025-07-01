"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { uploadPaymentProof } from "@/lib/actions/customer"
import { Plus, X, Upload, Calendar, Clock } from "lucide-react"

export function UploadPaymentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState<string[]>([""])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const addParticipant = () => {
    setParticipants([...participants, ""])
  }

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index))
    }
  }

  const updateParticipant = (index: number, value: string) => {
    const updated = [...participants]
    updated[index] = value
    setParticipants(updated)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  async function onSubmit(formData: FormData) {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Silakan pilih file bukti pembayaran",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Add participants to form data
      formData.append("participants", JSON.stringify(participants.filter((p) => p.trim())))
      formData.append("paymentProof", selectedFile)

      const result = await uploadPaymentProof(formData)

      if (result.success) {
        toast({
          title: "Upload berhasil!",
          description: "Bukti pembayaran telah diupload dan menunggu verifikasi admin.",
        })

        // Reset form
        setParticipants([""])
        setSelectedFile(null)
        setPreviewUrl(null)
        const form = document.getElementById("upload-form") as HTMLFormElement
        form?.reset()
      } else {
        toast({
          title: "Upload gagal",
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
      setIsLoading(false)
    }
  }

  return (
    <form id="upload-form" action={onSubmit} className="space-y-6">
      {/* Booking Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bookingDate" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Tanggal Booking</span>
          </Label>
          <Input
            id="bookingDate"
            name="bookingDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Pembayaran (Rp)</Label>
          <Input id="totalAmount" name="totalAmount" type="number" placeholder="500000" min="0" step="1000" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startTime" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Jam Mulai</span>
          </Label>
          <Input id="startTime" name="startTime" type="time" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Jam Selesai</Label>
          <Input id="endTime" name="endTime" type="time" required />
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Peserta yang Ikut Main</Label>
          <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Peserta
          </Button>
        </div>

        <div className="space-y-3">
          {participants.map((participant, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder={`Nama peserta ${index + 1}`}
                value={participant}
                onChange={(e) => updateParticipant(index, e.target.value)}
                required={index === 0}
              />
              {participants.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeParticipant(index)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600">Poin akan dibagi rata untuk semua peserta yang terdaftar di sistem</p>
      </div>

      {/* Payment Proof Upload */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Bukti Pembayaran</span>
        </Label>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Label htmlFor="paymentProof" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">Upload foto bukti pembayaran</span>
                <span className="mt-1 block text-sm text-gray-600">PNG, JPG, JPEG hingga 5MB</span>
              </Label>
              <Input
                id="paymentProof"
                name="paymentProof"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
            </div>
          </div>
        </div>

        {previewUrl && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile?.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Mengupload..." : "Upload Bukti Pembayaran"}
      </Button>
    </form>
  )
}
