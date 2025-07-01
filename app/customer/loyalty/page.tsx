import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { LoyaltyDashboard } from "@/components/customer/loyalty-dashboard"
import { AvailableRewards } from "@/components/customer/available-rewards"
import { RedemptionHistory } from "@/components/customer/redemption-history"
import { Gift, History } from "lucide-react"

export default async function LoyaltyPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
          <p className="text-gray-600 mt-2">Kelola poin loyalty dan tukar dengan hadiah menarik</p>
        </div>

        {/* Loyalty Points Overview */}
        <div className="mb-8">
          <LoyaltyDashboard />
        </div>

        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span>Available Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Redemption History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Hadiah yang Tersedia</CardTitle>
                <CardDescription>Tukarkan poin Anda dengan berbagai hadiah menarik</CardDescription>
              </CardHeader>
              <CardContent>
                <AvailableRewards />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Penukaran</CardTitle>
                <CardDescription>Lihat semua hadiah yang pernah Anda tukar</CardDescription>
              </CardHeader>
              <CardContent>
                <RedemptionHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
