import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const auditSession = await prisma.auditSession.create({
    data: {
      userId: session.user.id,
      status: "in_progress",
      currentDomain: 1,
    },
  })

  return NextResponse.json({ sessionId: auditSession.id }, { status: 201 })
}
