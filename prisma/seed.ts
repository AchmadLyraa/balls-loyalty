import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Hash password for users (password: admin123)
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Insert default system settings
    console.log('📝 Creating system settings...')
    await prisma.systemSettings.createMany({
      data: [
        {
          id: 'default_points_per_hour',
          key: 'default_points_per_hour',
          value: '15',
          description: 'Default points earned per hour of booking',
        },
        {
          id: 'max_qr_expiry_hours',
          key: 'max_qr_expiry_hours',
          value: '48',
          description: 'Maximum hours for QR code expiry',
        },
        {
          id: 'min_redemption_points',
          key: 'min_redemption_points',
          value: '25',
          description: 'Minimum points required for redemption',
        },
      ],
      skipDuplicates: true,
    })

    // Create default super admin user
    console.log('👤 Creating super admin user...')
    await prisma.user.upsert({
      where: { email: 'superadmin@balls.com' },
      update: {},
      create: {
        id: 'super-admin-001',
        email: 'superadmin@balls.com',
        name: 'Super Administrator',
        role: 'SUPER_ADMIN',
        password: hashedPassword,
        isActive: true,
      },
    })

    // Create sample customer users
    console.log('👥 Creating sample users...')
    const users = [
      {
        id: 'customer-001',
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '081234567890',
        role: UserRole.CUSTOMER,
      },
      {
        id: 'customer-002',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        phone: '081234567891',
        role: UserRole.CUSTOMER,
      },
      {
        id: 'customer-003',
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        phone: '081234567892',
        role: UserRole.CUSTOMER,
      },
      {
        id: 'admin-001',
        email: 'admin@balls.com',
        name: 'Admin BALLS',
        phone: '081234567893',
        role: UserRole.ADMIN,
      },
    ]

    for (const userData of users) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password: hashedPassword,
          isActive: true,
        },
      })
    }

    // Create loyalty programs
    console.log('🎁 Creating loyalty programs...')
    const loyaltyPrograms = [
      {
        id: 'program-001',
        name: 'Free 1 Hour Booking',
        description: 'Dapatkan 1 jam booking gratis',
        requiredPoints: 100,
        isActive: true,
        maxRedemptions: null,
        currentRedemptions: 0,
      },
      {
        id: 'program-002',
        name: 'BALLS T-Shirt',
        description: 'T-shirt eksklusif BALLS',
        requiredPoints: 200,
        isActive: true,
        maxRedemptions: 50,
        currentRedemptions: 0,
      },
      {
        id: 'program-003',
        name: 'Free 2 Hour Booking',
        description: 'Dapatkan 2 jam booking gratis',
        requiredPoints: 180,
        isActive: true,
        maxRedemptions: null,
        currentRedemptions: 0,
      },
      {
        id: 'program-004',
        name: 'BALLS Water Bottle',
        description: 'Botol minum eksklusif BALLS',
        requiredPoints: 80,
        isActive: true,
        maxRedemptions: 100,
        currentRedemptions: 0,
      },
      {
        id: 'program-005',
        name: 'VIP Booking Package',
        description: 'Paket booking VIP dengan fasilitas lengkap',
        requiredPoints: 500,
        isActive: true,
        maxRedemptions: 10,
        currentRedemptions: 0,
      },
      {
        id: 'program-006',
        name: 'BALLS Cap',
        description: 'Topi eksklusif BALLS dengan logo',
        requiredPoints: 120,
        isActive: true,
        maxRedemptions: 30,
        currentRedemptions: 0,
      },
      {
        id: 'program-007',
        name: 'Free 3 Hour Booking',
        description: 'Dapatkan 3 jam booking gratis',
        requiredPoints: 250,
        isActive: true,
        maxRedemptions: null,
        currentRedemptions: 0,
      },
      {
        id: 'program-008',
        name: 'BALLS Tumbler',
        description: 'Tumbler eksklusif BALLS 500ml',
        requiredPoints: 150,
        isActive: true,
        maxRedemptions: 25,
        currentRedemptions: 0,
      },
      {
        id: 'program-009',
        name: 'Monthly VIP Pass',
        description: 'Akses VIP selama 1 bulan',
        requiredPoints: 800,
        isActive: true,
        maxRedemptions: 5,
        currentRedemptions: 0,
      },
      {
        id: 'program-010',
        name: 'BALLS Jersey',
        description: 'Jersey eksklusif BALLS',
        requiredPoints: 300,
        isActive: true,
        maxRedemptions: 20,
        currentRedemptions: 0,
      },
    ]

    for (const program of loyaltyPrograms) {
      await prisma.loyaltyProgram.upsert({
        where: { id: program.id },
        update: {},
        create: program,
      })
    }

    // Create customer profiles
    console.log('📊 Creating customer profiles...')
    const customerProfiles = [
      {
        id: 'profile-001',
        userId: 'customer-001',
        totalPoints: 150,
        availablePoints: 150,
      },
      {
        id: 'profile-002',
        userId: 'customer-002',
        totalPoints: 80,
        availablePoints: 80,
      },
      {
        id: 'profile-003',
        userId: 'customer-003',
        totalPoints: 220,
        availablePoints: 220,
      },
    ]

    for (const profile of customerProfiles) {
      await prisma.customerProfile.upsert({
        where: { userId: profile.userId },
        update: {},
        create: profile,
      })
    }

    // Create point transactions
    console.log('💰 Creating point transactions...')
    const pointTransactions = [
      {
        id: 'trans-001',
        customerId: 'profile-001',
        type: 'EARNED',
        points: 50,
        description: 'Poin dari booking 2024-01-15',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: 'trans-002',
        customerId: 'profile-001',
        type: 'EARNED',
        points: 100,
        description: 'Poin dari booking 2024-01-20',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: 'trans-003',
        customerId: 'profile-002',
        type: 'EARNED',
        points: 80,
        description: 'Poin dari booking 2024-01-18',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        id: 'trans-004',
        customerId: 'profile-003',
        type: 'EARNED',
        points: 120,
        description: 'Poin dari booking 2024-01-22',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: 'trans-005',
        customerId: 'profile-003',
        type: 'EARNED',
        points: 100,
        description: 'Poin dari booking 2024-01-25',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ]

    for (const transaction of pointTransactions) {
      await prisma.pointTransaction.upsert({
        where: { id: transaction.id },
        update: {},
        create: transaction,
      })
    }

    console.log('✅ Database seeding completed successfully!')
    
    // Print summary
    console.log('\n📋 Seeding Summary:')
    console.log('- System Settings: 3 records')
    console.log('- Users: 5 records (1 super admin, 1 admin, 3 customers)')
    console.log('- Loyalty Programs: 10 records')
    console.log('- Customer Profiles: 3 records')
    console.log('- Point Transactions: 5 records')
    console.log('\n🔐 Default Login Credentials:')
    console.log('Super Admin: superadmin@balls.com / admin123')
    console.log('Admin: admin@balls.com / admin123')
    console.log('Customer: john.doe@example.com / admin123')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })