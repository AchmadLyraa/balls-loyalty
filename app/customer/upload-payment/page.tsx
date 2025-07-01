import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { UploadPaymentForm } from "@/components/customer/upload-payment-form"
import { PaymentHistory } from "@/components/customer/payment-history"
import { Upload, History } from "lucide-react"

export default async function UploadPaymentPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Bukti Pembayaran</h1>
          <p className="text-gray-600 mt-2">Upload bukti pembayaran booking untuk mendapatkan poin loyalty</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Bukti Transaksi</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Riwayat Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Bukti Pembayaran Booking</CardTitle>
                <CardDescription>
                  Upload foto bukti pembayaran dan detail booking untuk mendapatkan poin loyalty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadPaymentForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Upload Bukti Pembayaran</CardTitle>
                <CardDescription>Lihat status semua upload bukti pembayaran Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
