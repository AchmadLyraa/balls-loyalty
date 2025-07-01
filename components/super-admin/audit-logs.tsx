"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getAuditLogs } from "@/lib/actions/super-admin"
import { Search, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  oldValues: any
  newValues: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  user?: {
    name: string
    email: string
    role: string
  }
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [resourceFilter, setResourceFilter] = useState("all")

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const result = await getAuditLogs()
      if (result.success) {
        setLogs(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesResource = resourceFilter === "all" || log.resource === resourceFilter

    return matchesSearch && matchesAction && matchesResource
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return (
          <Badge variant="default" className="bg-green-600">
            Buat
          </Badge>
        )
      case "UPDATE":
        return (
          <Badge variant="default" className="bg-blue-600">
            Update
          </Badge>
        )
      case "DELETE":
        return <Badge variant="destructive">Hapus</Badge>
      case "APPROVE":
        return (
          <Badge variant="default" className="bg-green-600">
            Setujui
          </Badge>
        )
      case "REJECT":
        return <Badge variant="destructive">Tolak</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  const getResourceName = (resource: string) => {
    switch (resource) {
      case "user":
        return "User"
      case "payment_upload":
        return "Upload Pembayaran"
      case "redemption":
        return "Penukaran"
      case "loyalty_program":
        return "Program Loyalty"
      case "system_settings":
        return "Pengaturan Sistem"
      default:
        return resource
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari berdasarkan user, resource, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Action</SelectItem>
            <SelectItem value="CREATE">Buat</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Hapus</SelectItem>
            <SelectItem value="APPROVE">Setujui</SelectItem>
            <SelectItem value="REJECT">Tolak</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter Resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Resource</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="payment_upload">Upload Pembayaran</SelectItem>
            <SelectItem value="redemption">Penukaran</SelectItem>
            <SelectItem value="loyalty_program">Program Loyalty</SelectItem>
            <SelectItem value="system_settings">Pengaturan Sistem</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-4">
                    {getActionBadge(log.action)}
                    <span className="font-medium">{getResourceName(log.resource)}</span>
                    <span className="text-sm text-gray-600">ID: {log.resourceId}</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      <span className="font-medium">{log.user?.name || "Unknown User"}</span> (
                      {log.user?.email || "No email"}) • {log.user?.role || "No role"}
                    </p>
                    <p>{formatDate(log.createdAt)}</p>
                    {log.ipAddress && <p>IP: {log.ipAddress}</p>}
                  </div>

                  {/* Show changes if available */}
                  {(log.oldValues || log.newValues) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">Detail Perubahan:</p>
                      <div className="text-xs space-y-1">
                        {log.oldValues && (
                          <div>
                            <span className="font-medium text-red-600">Sebelum:</span>
                            <pre className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {JSON.stringify(log.oldValues, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.newValues && (
                          <div>
                            <span className="font-medium text-green-600">Sesudah:</span>
                            <pre className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {JSON.stringify(log.newValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak ada log ditemukan</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || actionFilter !== "all" || resourceFilter !== "all"
              ? "Coba ubah filter pencarian Anda."
              : "Belum ada aktivitas yang tercatat."}
          </p>
        </div>
      )}
    </div>
  )
}
