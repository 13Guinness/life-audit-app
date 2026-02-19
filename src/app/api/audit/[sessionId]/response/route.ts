import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId } = await params
  const body = await req.json()
  const { domain, answers } = body as {
    domain: number
    answers: Record<string, string>
  }

  if (!domain || domain < 1 || domain > 9) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 })
  }

  // Verify the session belongs to the current user
  const auditSession = await prisma.auditSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
  })

  if (!auditSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  // Upsert the AuditResponse for this domain
  await prisma.auditResponse.upsert({
    where: { auditSessionId_domain: { auditSessionId: sessionId, domain } },
    create: {
      auditSessionId: sessionId,
      domain,
      answers: JSON.stringify(answers),
    },
    update: {
      answers: JSON.stringify(answers),
    },
  })

  // Advance currentDomain (never go backwards)
  const nextDomain = Math.min(domain + 1, 9)
  const newCurrentDomain = Math.max(auditSession.currentDomain, nextDomain)

  await prisma.auditSession.update({
    where: { id: sessionId },
    data: { currentDomain: newCurrentDomain },
  })

  return NextResponse.json({ ok: true })
}
