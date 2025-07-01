"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getAvailableRewards, redeemReward } from "@/lib/actions/customer"
import type { LoyaltyProgram } from "@prisma/client"
import { Gift, Star, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface RewardWithAvailability extends LoyaltyProgram {
  canRedeem: boolean
  availablePoints: number
}

export function AvailableRewards() {
  const [rewards, setRewards] = useState<RewardWithAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchRewards()
  }, [])

  async function fetchRewards() {
    try {
      const result = await getAvailableRewards()
      if (result.success) {
        setRewards(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching rewards:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRedeem(rewardId: string) {
    setRedeemingId(rewardId)
    try {
      const result = await redeemReward(rewardId)
      if (result.success) {
        toast({
          title: "Penukaran berhasil!",
          description: "Hadiah Anda sedang diproses. QR code akan muncul setelah disetujui admin.",
        })
        // Close dialog immediately
        setOpenDialogs((prev) => ({ ...prev, [rewardId]: false }))
        fetchRewards() // Refresh data
      } else {
        toast({
          title: "Penukaran gagal",
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
      setRedeemingId(null)
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

  if (rewards.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada hadiah</h3>
        <p className="mt-2 text-gray-600">Hadiah akan segera tersedia.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewards.map((reward) => (
        <Card key={reward.id} className={`relative ${!reward.canRedeem ? "opacity-75" : ""}`}>
          {reward.thumbnail && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={reward.thumbnail || "/placeholder.svg"}
                alt={reward.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{reward.name}</CardTitle>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{reward.requiredPoints}</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">{reward.description}</p>

            <div className="flex items-center justify-between text-sm">
              {reward.maxRedemptions && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{reward.maxRedemptions - reward.currentRedemptions} tersisa</span>
                </div>
              )}
              <div className="text-right">
                <p className="text-xs text-gray-600">Poin Anda: {reward.availablePoints}</p>
              </div>
            </div>

            <Dialog
              open={openDialogs[reward.id] || false}
              onOpenChange={(open) => setOpenDialogs((prev) => ({ ...prev, [reward.id]: open }))}
            >
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  disabled={
                    !reward.canRedeem ||
                    (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) ||
                    redeemingId === reward.id
                  }
                  onClick={() => setOpenDialogs((prev) => ({ ...prev, [reward.id]: true }))}
                >
                  {!reward.canRedeem
                    ? `Butuh ${reward.requiredPoints - reward.availablePoints} poin lagi`
                    : reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions
                      ? "Stok habis"
                      : redeemingId === reward.id
                        ? "Memproses..."
                        : "Tukar Sekarang"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Konfirmasi Penukaran</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin ingin menukar {reward.requiredPoints} poin untuk {reward.name}?
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Hadiah:</span>
                      <span className="font-medium">{reward.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Poin dibutuhkan:</span>
                      <span className="font-medium">{reward.requiredPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Poin Anda saat ini:</span>
                      <span className="font-medium">{reward.availablePoints}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Sisa poin setelah penukaran:</span>
                      <span className="font-medium">{reward.availablePoints - reward.requiredPoints}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => handleRedeem(reward.id)} disabled={redeemingId === reward.id}>
                    {redeemingId === reward.id ? "Memproses..." : "Konfirmasi Penukaran"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

