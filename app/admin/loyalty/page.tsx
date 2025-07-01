import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoyaltyProgramManagement } from "@/components/admin/loyalty-program-management"
import { RedemptionManagement } from "@/components/admin/redemption-management"
import { QRScanner } from "@/components/admin/qr-scanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, QrCode, CheckCircle } from "lucide-react"

export default async function AdminLoyaltyPage() {
  const session = await getServerSession(authOptions)

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Loyalty Program</h1>
          <p className="text-gray-600 mt-2">Kelola program loyalty, hadiah, dan verifikasi penukaran</p>
        </div>

        <Tabs defaultValue="programs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="programs" className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span>Program Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Kelola Penukaran</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center space-x-2">
              <QrCode className="w-4 h-4" />
              <span>QR Scanner</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle>Program Loyalty & Hadiah</CardTitle>
                <CardDescription>Kelola hadiah yang tersedia untuk ditukar customer</CardDescription>
              </CardHeader>
              <CardContent>
                <LoyaltyProgramManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redemptions">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Penukaran Hadiah</CardTitle>
                <CardDescription>Setujui atau tolak penukaran hadiah dari customer</CardDescription>
              </CardHeader>
              <CardContent>
                <RedemptionManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
                <CardDescription>Scan QR code customer untuk verifikasi pengambilan hadiah</CardDescription>
              </CardHeader>
              <CardContent>
                <QRScanner />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
