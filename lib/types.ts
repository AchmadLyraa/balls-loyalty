import type {
  User,
  CustomerProfile,
  PaymentUpload,
  BookingParticipant,
  PointTransaction,
  LoyaltyProgram,
  Redemption,
  UserRole,
  PaymentUploadStatus,
  RedemptionStatus,
} from "@prisma/client"

export type UserWithProfile = User & {
  customerProfile?: CustomerProfile | null
}

export type PaymentUploadWithDetails = PaymentUpload & {
  customer: CustomerProfile & {
    user: User
  }
  bookingParticipants: (BookingParticipant & {
    customerProfile?:
      | (CustomerProfile & {
          user: User
        })
      | null
  })[]
}

export type RedemptionWithDetails = Redemption & {
  customer: CustomerProfile & {
    user: User
  }
  program: LoyaltyProgram
}

export type PointTransactionWithDetails = PointTransaction & {
  paymentUpload?: PaymentUpload | null
  redemption?:
    | (Redemption & {
        program: LoyaltyProgram
      })
    | null
}

export type { UserRole, PaymentUploadStatus, RedemptionStatus }
