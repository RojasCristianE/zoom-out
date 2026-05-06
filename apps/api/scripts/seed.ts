import { db } from '@api/lib/db'
import { users } from '@db/schema'
import { hashPassword } from '@api/lib/auth'

async function seed() {
  console.log('🌱 Seeding database...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@zoomout.local'
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

  try {
    const passwordHash = await hashPassword(adminPass)
    
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      displayName: 'Super Admin',
      role: 'admin'
    }).onConflictDoNothing()

    console.log('✅ Admin user created successfully')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPass}`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()
