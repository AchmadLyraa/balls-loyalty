import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminManagement } from "@/components/super-admin/admin-management"
import { SystemStats } from "@/components/super-admin/system-stats"
import { AuditLogs } from "@/components/super-admin/audit-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BarChart3, FileText, Shield } from "lucide-react"

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Shield className="w-8 h-8 text-red-600" />
            <span>Super Admin Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-2">Kelola admin, monitor sistem, dan lihat audit logs</p>
        </div>

        <Tabs defaultValue="admins" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admins" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Admin Management</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>System Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Audit Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Admin</CardTitle>
                <CardDescription>Kelola akun admin dan hak akses mereka</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Statistik Sistem</CardTitle>
                <CardDescription>Overview performa dan penggunaan sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemStats />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Riwayat aktivitas admin dan perubahan sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <AuditLogs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
