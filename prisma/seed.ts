import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("fvm2026!", 12)

  const admin = await prisma.user.upsert({
    where: { email: "matt@fuelvm.com" },
    update: { password: hashedPassword, role: "admin" },
    create: {
      email: "matt@fuelvm.com",
      name: "Matt",
      password: hashedPassword,
      role: "admin",
    },
  })

  console.log(`Seeded admin user: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
