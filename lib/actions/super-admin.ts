"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const createAdminSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

const updateAdminSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
})

export async function getAdminUsers() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: admins }
  } catch (error) {
    console.error("Get admin users error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil data admin" }
  }
}

export async function createAdminUser(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const validatedFields = createAdminSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0].message,
      }
    }

    const { name, email, phone, role, password } = validatedFields.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        success: false,
        error: "Email sudah terdaftar",
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        password: hashedPassword,
        createdById: session.user.id,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "user",
        resourceId: admin.id,
        newValues: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    })

    return { success: true, data: admin }
  } catch (error) {
    console.error("Create admin user error:", error)
    return { success: false, error: "Terjadi kesalahan saat membuat admin" }
  }
}

export async function updateAdminUser(adminId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { id: adminId },
    })

    if (!existingAdmin) {
      return { success: false, error: "Admin tidak ditemukan" }
    }

    const password = formData.get("password") as string
    const validatedFields = updateAdminSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      password: password || undefined,
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0].message,
      }
    }

    const { name, email, phone, role, password: newPassword } = validatedFields.data

    // Check if email is taken by another user
    if (email !== existingAdmin.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists) {
        return {
          success: false,
          error: "Email sudah digunakan oleh user lain",
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      role,
    }

    // Hash new password if provided
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update admin
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: updateData,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "user",
        resourceId: adminId,
        oldValues: {
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role,
        },
        newValues: {
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          role: updatedAdmin.role,
        },
      },
    })

    return { success: true, data: updatedAdmin }
  } catch (error) {
    console.error("Update admin user error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengupdate admin" }
  }
}

export async function deleteAdminUser(adminId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { id: adminId },
    })

    if (!existingAdmin) {
      return { success: false, error: "Admin tidak ditemukan" }
    }

    // Don't allow deleting self
    if (adminId === session.user.id) {
      return { success: false, error: "Tidak dapat menghapus akun sendiri" }
    }

    // Delete admin
    await prisma.user.delete({
      where: { id: adminId },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        resource: "user",
        resourceId: adminId,
        oldValues: {
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Delete admin user error:", error)
    return { success: false, error: "Terjadi kesalahan saat menghapus admin" }
  }
}

export async function toggleAdminStatus(adminId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { id: adminId },
    })

    if (!existingAdmin) {
      return { success: false, error: "Admin tidak ditemukan" }
    }

    // Don't allow deactivating self
    if (adminId === session.user.id) {
      return { success: false, error: "Tidak dapat menonaktifkan akun sendiri" }
    }

    // Toggle status
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: {
        isActive: !existingAdmin.isActive,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "user",
        resourceId: adminId,
        oldValues: {
          isActive: existingAdmin.isActive,
        },
        newValues: {
          isActive: updatedAdmin.isActive,
        },
      },
    })

    return { success: true, data: updatedAdmin }
  } catch (error) {
    console.error("Toggle admin status error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengubah status admin" }
  }
}

export async function getSystemStats() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Get basic counts
    const [
      totalCustomers,
      totalAdmins,
      totalUploads,
      pendingUploads,
      totalRedemptions,
      pendingRedemptions,
      activePrograms,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
      prisma.paymentUpload.count(),
      prisma.paymentUpload.count({ where: { status: "PENDING" } }),
      prisma.redemption.count(),
      prisma.redemption.count({ where: { status: "PENDING" } }),
      prisma.loyaltyProgram.count({ where: { isActive: true } }),
    ])

    // Get points stats
    const pointsStats = await prisma.pointTransaction.groupBy({
      by: ["type"],
      _sum: {
        points: true,
      },
    })

    const totalPointsDistributed = pointsStats.find((stat) => stat.type === "EARNED")?._sum.points || 0
    const totalPointsRedeemed = Math.abs(pointsStats.find((stat) => stat.type === "REDEEMED")?._sum.points || 0)

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))

      const [uploads, redemptions, newCustomers] = await Promise.all([
        prisma.paymentUpload.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        prisma.redemption.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        prisma.user.count({
          where: {
            role: "CUSTOMER",
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
      ])

      recentActivity.push({
        date: startOfDay.toISOString(),
        uploads,
        redemptions,
        newCustomers,
      })
    }

    const stats = {
      totalCustomers,
      totalAdmins,
      totalUploads,
      pendingUploads,
      totalRedemptions,
      pendingRedemptions,
      totalPointsDistributed,
      totalPointsRedeemed,
      activePrograms,
      recentActivity,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error("Get system stats error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil statistik" }
  }
}

export async function getAuditLogs() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 logs
    })

    return { success: true, data: logs }
  } catch (error) {
    console.error("Get audit logs error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil audit logs" }
  }
}
