"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getCustomerLoyaltyData } from "@/lib/actions/customer"
import { Trophy, Star, TrendingUp, Gift } from "lucide-react"

interface LoyaltyData {
  totalPoints: number
  availablePoints: number
  totalEarned: number
  totalRedeemed: number
  nextRewardPoints: number
  nextRewardName: string
}

export function LoyaltyDashboard() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLoyaltyData() {
      try {
        const result = await getCustomerLoyaltyData()
        if (result.success) {
          setLoyaltyData(result.data)
        }
      } catch (error) {
        console.error("Error fetching loyalty data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoyaltyData()
  }, [])

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!loyaltyData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Gagal memuat data loyalty</p>
        </CardContent>
      </Card>
    )
  }

  const progressToNextReward =
    loyaltyData.nextRewardPoints > 0 ? (loyaltyData.availablePoints / loyaltyData.nextRewardPoints) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poin Tersedia</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{loyaltyData.availablePoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Siap untuk ditukar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{loyaltyData.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sepanjang masa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poin Diperoleh</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loyaltyData.totalEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Dari booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poin Ditukar</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{loyaltyData.totalRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Untuk hadiah</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Reward */}
      {loyaltyData.nextRewardPoints > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress ke Hadiah Berikutnya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{loyaltyData.nextRewardName}</span>
              <span className="text-sm text-gray-600">
                {loyaltyData.availablePoints} / {loyaltyData.nextRewardPoints} poin
              </span>
            </div>
            <Progress value={Math.min(progressToNextReward, 100)} className="h-2" />
            <p className="text-sm text-gray-600">
              {loyaltyData.nextRewardPoints - loyaltyData.availablePoints > 0
                ? `Butuh ${(loyaltyData.nextRewardPoints - loyaltyData.availablePoints).toLocaleString()} poin lagi`
                : "Anda sudah bisa menukar hadiah ini!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
