import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendReportEmail } from "@/lib/email"

export const runtime = "nodejs"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reportId } = await params

  const report = await prisma.auditReport.findUnique({
    where: { id: reportId },
    include: {
      auditSession: {
        include: { user: true },
      },
    },
  })

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  // Only the report owner or an admin can trigger the email
  const isOwner = report.auditSession.userId === session.user.id
  const isAdmin = session.user.role === "admin"
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const user = report.auditSession.user
  const email = user?.email
  const name = user?.name || "there"

  if (!email) {
    return NextResponse.json({ error: "No email on record for this user" }, { status: 400 })
  }

  const result = await sendReportEmail(email, name, reportId)

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Email failed" }, { status: 500 })
  }

  // Record when the report was emailed
  await prisma.auditReport.update({
    where: { id: reportId },
    data: { emailedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
