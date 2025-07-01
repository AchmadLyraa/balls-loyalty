import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VerifyUploadList } from "@/components/admin/verify-upload-list"
import { PointsSettings } from "@/components/admin/points-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Settings } from "lucide-react"

export default async function VerifyUploadPage() {
  const session = await getServerSession(authOptions)

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Upload Pembayaran</h1>
          <p className="text-gray-600 mt-2">Verifikasi bukti pembayaran customer dan atur poin loyalty</p>
        </div>

        <Tabs defaultValue="verify" className="space-y-6">
          <TabsList>
            <TabsTrigger value="verify" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Verifikasi Upload</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Pengaturan Poin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verify">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Upload Menunggu Verifikasi</CardTitle>
                <CardDescription>Review dan setujui bukti pembayaran dari customer</CardDescription>
              </CardHeader>
              <CardContent>
                <VerifyUploadList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Poin Loyalty</CardTitle>
                <CardDescription>Atur berapa poin yang diberikan per jam booking</CardDescription>
              </CardHeader>
              <CardContent>
                <PointsSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
