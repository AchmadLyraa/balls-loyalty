"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

const loyaltyProgramSchema = z.object({
  name: z.string().min(1, "Nama program harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  requiredPoints: z
    .string()
    .transform((val) => Number.parseInt(val))
    .refine((val) => val > 0, "Poin harus lebih dari 0"),
  maxRedemptions: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val) : null)),
})

export async function getLoyaltyPrograms() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const programs = await prisma.loyaltyProgram.findMany({
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: programs }
  } catch (error) {
    console.error("Get loyalty programs error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil data program" }
  }
}

export async function createLoyaltyProgram(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const validatedFields = loyaltyProgramSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      requiredPoints: formData.get("requiredPoints"),
      maxRedemptions: formData.get("maxRedemptions"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0].message,
      }
    }

    const { name, description, requiredPoints, maxRedemptions } = validatedFields.data

    // Handle thumbnail upload
    let thumbnailPath = null
    const file = formData.get("thumbnail") as File
    if (file && file.size > 0) {
      const uploadDir = join(process.cwd(), "public", "uploads", "programs")
      await mkdir(uploadDir, { recursive: true })

      const fileExtension = file.name.split(".").pop()
      const fileName = `${randomUUID()}.${fileExtension}`
      const filePath = join(uploadDir, fileName)
      thumbnailPath = `/uploads/programs/${fileName}`

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
    }

    // Create program
    const program = await prisma.loyaltyProgram.create({
      data: {
        name,
        description,
        requiredPoints,
        maxRedemptions,
        thumbnail: thumbnailPath,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "loyalty_program",
        resourceId: program.id,
        newValues: {
          name: program.name,
          requiredPoints: program.requiredPoints,
        },
      },
    })

    return { success: true, data: program }
  } catch (error) {
    console.error("Create loyalty program error:", error)
    return { success: false, error: "Terjadi kesalahan saat membuat program" }
  }
}

export async function updateLoyaltyProgram(programId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const existingProgram = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
    })

    if (!existingProgram) {
      return { success: false, error: "Program tidak ditemukan" }
    }

    const validatedFields = loyaltyProgramSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      requiredPoints: formData.get("requiredPoints"),
      maxRedemptions: formData.get("maxRedemptions"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0].message,
      }
    }

    const { name, description, requiredPoints, maxRedemptions } = validatedFields.data

    // Handle thumbnail upload
    let thumbnailPath = existingProgram.thumbnail
    const file = formData.get("thumbnail") as File
    if (file && file.size > 0) {
      const uploadDir = join(process.cwd(), "public", "uploads", "programs")
      await mkdir(uploadDir, { recursive: true })

      const fileExtension = file.name.split(".").pop()
      const fileName = `${randomUUID()}.${fileExtension}`
      const filePath = join(uploadDir, fileName)
      thumbnailPath = `/uploads/programs/${fileName}`

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
    }

    // Update program
    const updatedProgram = await prisma.loyaltyProgram.update({
      where: { id: programId },
      data: {
        name,
        description,
        requiredPoints,
        maxRedemptions,
        thumbnail: thumbnailPath,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "loyalty_program",
        resourceId: programId,
        oldValues: {
          name: existingProgram.name,
          requiredPoints: existingProgram.requiredPoints,
        },
        newValues: {
          name: updatedProgram.name,
          requiredPoints: updatedProgram.requiredPoints,
        },
      },
    })

    return { success: true, data: updatedProgram }
  } catch (error) {
    console.error("Update loyalty program error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengupdate program" }
  }
}

export async function deleteLoyaltyProgram(programId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const existingProgram = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
      include: {
        redemptions: true,
      },
    })

    if (!existingProgram) {
      return { success: false, error: "Program tidak ditemukan" }
    }

    // Check if program has redemptions
    if (existingProgram.redemptions.length > 0) {
      return { success: false, error: "Tidak dapat menghapus program yang sudah memiliki penukaran" }
    }

    // Delete program
    await prisma.loyaltyProgram.delete({
      where: { id: programId },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        resource: "loyalty_program",
        resourceId: programId,
        oldValues: {
          name: existingProgram.name,
          requiredPoints: existingProgram.requiredPoints,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Delete loyalty program error:", error)
    return { success: false, error: "Terjadi kesalahan saat menghapus program" }
  }
}

export async function toggleProgramStatus(programId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const existingProgram = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
    })

    if (!existingProgram) {
      return { success: false, error: "Program tidak ditemukan" }
    }

    // Toggle status
    const updatedProgram = await prisma.loyaltyProgram.update({
      where: { id: programId },
      data: {
        isActive: !existingProgram.isActive,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "loyalty_program",
        resourceId: programId,
        oldValues: {
          isActive: existingProgram.isActive,
        },
        newValues: {
          isActive: updatedProgram.isActive,
        },
      },
    })

    return { success: true, data: updatedProgram }
  } catch (error) {
    console.error("Toggle program status error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengubah status program" }
  }
}

export async function getPendingRedemptions() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const redemptions = await prisma.redemption.findMany({
      where: { status: "PENDING" },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        program: true,
      },
      orderBy: { createdAt: "asc" },
    })

    return { success: true, data: redemptions }
  } catch (error) {
    console.error("Get pending redemptions error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil data penukaran" }
  }
}

export async function verifyRedemption(redemptionId: string, action: "approve" | "reject", formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        program: true,
      },
    })

    if (!redemption) {
      return { success: false, error: "Penukaran tidak ditemukan" }
    }

    if (redemption.status !== "PENDING") {
      return { success: false, error: "Penukaran sudah diproses sebelumnya" }
    }

    const adminNotes = formData.get("adminNotes") as string

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      if (action === "approve") {
        // Update redemption status
        await tx.redemption.update({
          where: { id: redemptionId },
          data: {
            status: "APPROVED",
            adminNotes,
            approvedBy: session.user.id,
            approvedAt: new Date(),
          },
        })

        // Update program redemption count
        await tx.loyaltyProgram.update({
          where: { id: redemption.programId },
          data: {
            currentRedemptions: {
              increment: 1,
            },
          },
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            action: "APPROVE",
            resource: "redemption",
            resourceId: redemptionId,
            newValues: {
              status: "APPROVED",
              programName: redemption.program.name,
              customerName: redemption.customer.user.name,
            },
          },
        })
      } else {
        // Reject redemption - refund points to customer
        await tx.redemption.update({
          where: { id: redemptionId },
          data: {
            status: "REJECTED",
            adminNotes,
            approvedBy: session.user.id,
            approvedAt: new Date(),
          },
        })

        // Refund points to customer
        await tx.customerProfile.update({
          where: { id: redemption.customerId },
          data: {
            availablePoints: {
              increment: redemption.pointsUsed,
            },
          },
        })

        // Create refund point transaction
        await tx.pointTransaction.create({
          data: {
            customerId: redemption.customerId,
            type: "EARNED",
            points: redemption.pointsUsed,
            description: `Refund penukaran ditolak: ${redemption.program.name}`,
            redemptionId: redemption.id,
          },
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            action: "REJECT",
            resource: "redemption",
            resourceId: redemptionId,
            newValues: {
              status: "REJECTED",
              reason: adminNotes,
              refundedPoints: redemption.pointsUsed,
            },
          },
        })
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Verify redemption error:", error)
    return { success: false, error: "Terjadi kesalahan saat memproses penukaran" }
  }
}

export async function scanQRCode(qrCode: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const redemption = await prisma.redemption.findUnique({
      where: { qrCode },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        program: true,
      },
    })

    if (!redemption) {
      return { success: false, error: "QR Code tidak ditemukan" }
    }

    return { success: true, data: redemption }
  } catch (error) {
    console.error("Scan QR code error:", error)
    return { success: false, error: "Terjadi kesalahan saat memindai QR code" }
  }
}

export async function markRedemptionAsUsed(redemptionId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: {
        program: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!redemption) {
      return { success: false, error: "Penukaran tidak ditemukan" }
    }

    if (redemption.status !== "APPROVED") {
      return { success: false, error: "Penukaran belum disetujui" }
    }

    if (redemption.status === "USED") {
      return { success: false, error: "QR Code sudah digunakan" }
    }

    // Check if QR code is expired
    if (redemption.qrCodeExpiry && new Date() > redemption.qrCodeExpiry) {
      return { success: false, error: "QR Code sudah expired" }
    }

    // Mark as used
    await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: "USED",
        usedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "redemption",
        resourceId: redemptionId,
        newValues: {
          status: "USED",
          usedAt: new Date(),
          programName: redemption.program.name,
          customerName: redemption.customer.user.name,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Mark redemption as used error:", error)
    return { success: false, error: "Terjadi kesalahan saat menandai sebagai digunakan" }
  }
}

export async function getPendingUploads() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    console.log("Fetching pending uploads...") // Debug log

    const uploads = await prisma.paymentUpload.findMany({
      where: { status: "PENDING" },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        bookingParticipants: {
          include: {
            customerProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    console.log(`Found ${uploads.length} pending uploads`) // Debug log

    // Serialize the data to ensure totalAmount is a number
    const serializedUploads = uploads.map((upload) => ({
      ...upload,
      totalAmount: upload.totalAmount ? Number(upload.totalAmount) : null,
    }))

    return { success: true, data: serializedUploads }
  } catch (error) {
    console.error("Get pending uploads error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil data upload" }
  }
}

export async function getSystemSettings() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const settings = await prisma.systemSettings.findMany()

    // Convert to key-value object for easier access
    const settingsObject = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>,
    )

    return { success: true, data: settingsObject }
  } catch (error) {
    console.error("Get system settings error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil pengaturan sistem" }
  }
}

export async function updateSystemSettings(settings: {
  defaultPointsPerHour: string
  maxQrExpiryHours: string
  minRedemptionPoints: string
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    // Update each setting
    await Promise.all([
      prisma.systemSettings.upsert({
        where: { key: "default_points_per_hour" },
        update: { value: settings.defaultPointsPerHour },
        create: {
          key: "default_points_per_hour",
          value: settings.defaultPointsPerHour,
          description: "Default points earned per hour of booking",
        },
      }),
      prisma.systemSettings.upsert({
        where: { key: "max_qr_expiry_hours" },
        update: { value: settings.maxQrExpiryHours },
        create: {
          key: "max_qr_expiry_hours",
          value: settings.maxQrExpiryHours,
          description: "Maximum hours for QR code expiry",
        },
      }),
      prisma.systemSettings.upsert({
        where: { key: "min_redemption_points" },
        update: { value: settings.minRedemptionPoints },
        create: {
          key: "min_redemption_points",
          value: settings.minRedemptionPoints,
          description: "Minimum points required for redemption",
        },
      }),
    ])

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "system_settings",
        resourceId: "system_settings",
        newValues: settings,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Update system settings error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengupdate pengaturan" }
  }
}

export async function verifyPaymentUpload(uploadId: string, action: "approve" | "reject", formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const upload = await prisma.paymentUpload.findUnique({
      where: { id: uploadId },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        bookingParticipants: {
          include: {
            customerProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!upload) {
      return { success: false, error: "Upload tidak ditemukan" }
    }

    if (upload.status !== "PENDING") {
      return { success: false, error: "Upload sudah diproses sebelumnya" }
    }

    const adminNotes = formData.get("adminNotes") as string

    if (action === "approve") {
      const pointsPerHour = Number.parseInt(formData.get("pointsPerHour") as string) || 10
      const totalPoints = upload.durationHours * pointsPerHour

      // Count registered participants
      const registeredParticipants = upload.bookingParticipants.filter((p) => p.customerProfile)
      const pointsPerParticipant =
        registeredParticipants.length > 0 ? Math.floor(totalPoints / registeredParticipants.length) : 0

      // Update upload status
      await prisma.paymentUpload.update({
        where: { id: uploadId },
        data: {
          status: "APPROVED",
          adminNotes,
          approvedBy: session.user.id,
          approvedAt: new Date(),
        },
      })

      // Distribute points to registered participants
      for (const participant of registeredParticipants) {
        if (participant.customerProfile) {
          // Update customer points
          await prisma.customerProfile.update({
            where: { id: participant.customerProfile.id },
            data: {
              totalPoints: {
                increment: pointsPerParticipant,
              },
              availablePoints: {
                increment: pointsPerParticipant,
              },
            },
          })

          // Create point transaction
          await prisma.pointTransaction.create({
            data: {
              customerId: participant.customerProfile.id,
              type: "EARNED",
              points: pointsPerParticipant,
              description: `Poin dari booking ${upload.bookingDate.toLocaleDateString("id-ID")}`,
              paymentUploadId: upload.id,
            },
          })

          // Update participant points allocated
          await prisma.bookingParticipant.update({
            where: { id: participant.id },
            data: {
              pointsAllocated: pointsPerParticipant,
            },
          })
        }
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "APPROVE",
          resource: "payment_upload",
          resourceId: uploadId,
          newValues: {
            status: "APPROVED",
            totalPointsDistributed: totalPoints,
            participantsCount: registeredParticipants.length,
          },
        },
      })
    } else {
      // Reject upload
      await prisma.paymentUpload.update({
        where: { id: uploadId },
        data: {
          status: "REJECTED",
          adminNotes,
          approvedBy: session.user.id,
          approvedAt: new Date(),
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "REJECT",
          resource: "payment_upload",
          resourceId: uploadId,
          newValues: {
            status: "REJECTED",
            reason: adminNotes,
          },
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Verify payment upload error:", error)
    return { success: false, error: "Terjadi kesalahan saat memproses upload" }
  }
}

