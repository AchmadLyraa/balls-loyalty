"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { uploadFileToSupabase } from "@/lib/supabase-storage"

const uploadPaymentSchema = z.object({
  bookingDate: z.string().min(1, "Tanggal booking harus diisi"),
  startTime: z.string().min(1, "Jam mulai harus diisi"),
  endTime: z.string().min(1, "Jam selesai harus diisi"),
  totalAmount: z.string().optional(),
  participants: z.string().min(1, "Minimal satu peserta harus diisi"),
})

export async function uploadPaymentProof(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CUSTOMER") {
      return { success: false, error: "Unauthorized" }
    }

    // Get customer profile
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!customerProfile) {
      return { success: false, error: "Customer profile not found" }
    }

    // Validate form data
    const validatedFields = uploadPaymentSchema.safeParse({
      bookingDate: formData.get("bookingDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      totalAmount: formData.get("totalAmount"),
      participants: formData.get("participants"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0].message,
      }
    }

    const { bookingDate, startTime, endTime, totalAmount, participants } = validatedFields.data

    // Parse participants
    const participantsList = JSON.parse(participants) as string[]
    if (participantsList.length === 0) {
      return { success: false, error: "Minimal satu peserta harus diisi" }
    }

    // Handle file upload
    const file = formData.get("paymentProof") as File
    if (!file) {
      return { success: false, error: "File bukti pembayaran harus diupload" }
    }

    // Create upload directory if it doesn't exist
//    const uploadDir = join(process.cwd(), "public", "uploads", "payments")
//    await mkdir(uploadDir, { recursive: true })
//
//    // Generate unique filename
//    const fileExtension = file.name.split(".").pop()
//    const fileName = `${randomUUID()}.${fileExtension}`
//    const filePath = join(uploadDir, fileName)
//    const publicPath = `/uploads/payments/${fileName}`
//
//    // Save file
//    const bytes = await file.arrayBuffer()
//    const buffer = Buffer.from(bytes)
//    await writeFile(filePath, buffer)
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Ukuran file maksimal 5MB" }
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File harus berupa gambar" }
    }

    // Upload to Supabase Storage
    const uploadResult = await uploadFileToSupabase(file, "payment-proofs", `customer-${customerProfile.id}`)

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error || "Gagal mengupload file" }
    }

    // Calculate duration
    const startDateTime = new Date(`${bookingDate}T${startTime}`)
    const endDateTime = new Date(`${bookingDate}T${endTime}`)
    const durationHours = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60))

    // Create payment upload record
    const paymentUpload = await prisma.paymentUpload.create({
      data: {
        customerId: customerProfile.id,
        bookingDate: new Date(bookingDate),
        startTime: startDateTime,
        endTime: endDateTime,
        durationHours,
//        paymentProof: publicPath,
        paymentProof: uploadResult.url!,
        totalAmount: totalAmount ? Number.parseFloat(totalAmount) : null,
        status: "PENDING",
      },
    })

    // Create booking participants
    for (const participantName of participantsList) {
      if (participantName.trim()) {
        // Check if participant is a registered customer
        const participantUser = await prisma.user.findFirst({
          where: {
            name: {
              contains: participantName.trim(),
              mode: "insensitive",
            },
            role: "CUSTOMER",
          },
          include: {
            customerProfile: true,
          },
        })

        await prisma.bookingParticipant.create({
          data: {
            paymentUploadId: paymentUpload.id,
            customerName: participantName.trim(),
            customerId: participantUser?.customerProfile?.id || null,
            pointsAllocated: 0, // Will be calculated when approved
          },
        })
      }
    }

    return {
      success: true,
      data: {
        ...paymentUpload,
        totalAmount: paymentUpload.totalAmount ? Number(paymentUpload.totalAmount) : null,
      },
    }
  } catch (error) {
    console.error("Upload payment proof error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengupload" }
  }
}

export async function getPaymentHistory() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CUSTOMER") {
      return { success: false, error: "Unauthorized" }
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!customerProfile) {
      return { success: false, error: "Customer profile not found" }
    }

    const payments = await prisma.paymentUpload.findMany({
      where: { customerId: customerProfile.id },
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
      orderBy: { createdAt: "desc" },
    })

    const serializedPayments = payments.map((payment) => ({
      ...payment,
      totalAmount: payment.totalAmount ? Number(payment.totalAmount) : null,
    }))
    return { success: true, data: serializedPayments }
  } catch (error) {
    console.error("Get payment history error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil data" }
  }
}

export async function getCustomerLoyaltyData() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CUSTOMER") {
      return { success: false, error: "Unauthorized" }
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        pointTransactions: true,
      },
    })

    if (!customerProfile) {
      return { success: false, error: "Customer profile not found" }
    }

    // Calculate stats
    const totalEarned = customerProfile.pointTransactions
      .filter((t) => t.type === "EARNED")
      .reduce((sum, t) => sum + t.points, 0)

    const totalRedeemed = Math.abs(
      customerProfile.pointTransactions.filter((t) => t.type === "REDEEMED").reduce((sum, t) => sum + t.points, 0),
    )

    // Find next achievable reward
    const nextReward = await prisma.loyaltyProgram.findFirst({
      where: {
        isActive: true,
        requiredPoints: {
          gt: customerProfile.availablePoints,
        },
      },
      orderBy: { requiredPoints: "asc" },
    })

    return {
      success: true,
      data: {
        totalPoints: customerProfile.totalPoints,
        availablePoints: customerProfile.availablePoints,
        totalEarned,
        totalRedeemed,
        nextRewardPoints: nextReward?.requiredPoints || 0,
        nextRewardName: nextReward?.name || "",
      },
    }
  } catch (error) {
    console.error("Get customer loyalty data error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil data" }
  }
}

export async function getAvailableRewards() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CUSTOMER") {
      return { success: false, error: "Unauthorized" }
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!customerProfile) {
      return { success: false, error: "Customer profile not found" }
    }

    const rewards = await prisma.loyaltyProgram.findMany({
      where: { isActive: true },
      orderBy: { requiredPoints: "asc" },
    })

    const rewardsWithAvailability = rewards.map((reward) => ({
      ...reward,
      canRedeem: customerProfile.availablePoints >= reward.requiredPoints,
      availablePoints: customerProfile.availablePoints,
    }))

    return { success: true, data: rewardsWithAvailability }
  } catch (error) {
    console.error("Get available rewards error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil data" }
  }
}

export async function redeemReward(rewardId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CUSTOMER") {
      return { success: false, error: "Unauthorized" }
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!customerProfile) {
      return { success: false, error: "Customer profile not found" }
    }

    const reward = await prisma.loyaltyProgram.findUnique({
      where: { id: rewardId },
    })

    if (!reward || !reward.isActive) {
      return { success: false, error: "Hadiah tidak tersedia" }
    }

    if (customerProfile.availablePoints < reward.requiredPoints) {
      return { success: false, error: "Poin tidak mencukupi" }
    }

    if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
      return { success: false, error: "Stok hadiah habis" }
    }

    // Generate QR code
//    const qrCode = `BALLS-${randomUUID()}`
    const qrCode = `BALLS-${crypto.randomUUID()}`
    const qrCodeExpiry = new Date()
    qrCodeExpiry.setHours(qrCodeExpiry.getHours() + 24) // 24 hours expiry

    // Create redemption record
    const redemption = await prisma.redemption.create({
      data: {
        customerId: customerProfile.id,
        programId: reward.id,
        status: "PENDING",
        pointsUsed: reward.requiredPoints,
        qrCode,
        qrCodeExpiry,
      },
    })

    // Update customer points (temporarily deduct, will be finalized when approved)
    await prisma.customerProfile.update({
      where: { id: customerProfile.id },
      data: {
        availablePoints: customerProfile.availablePoints - reward.requiredPoints,
      },
    })

    // Create point transaction
    await prisma.pointTransaction.create({
      data: {
        customerId: customerProfile.id,
        type: "REDEEMED",
        points: -reward.requiredPoints,
        description: `Penukaran hadiah: ${reward.name}`,
        redemptionId: redemption.id,
      },
    })

    return { success: true, data: redemption }
  } catch (error) {
    console.error("Redeem reward error:", error)
    return { success: false, error: "Terjadi kesalahan saat menukar hadiah" }
  }
}

export async function getRedemptionHistory() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CUSTOMER") {
      return { success: false, error: "Unauthorized" }
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!customerProfile) {
      return { success: false, error: "Customer profile not found" }
    }

    const redemptions = await prisma.redemption.findMany({
      where: { customerId: customerProfile.id },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        program: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: redemptions }
  } catch (error) {
    console.error("Get redemption history error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengambil data" }
  }
}

