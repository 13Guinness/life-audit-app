import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { ReportPDF, parseReportData } from "@/lib/pdf"

export const runtime = "nodejs"

export async function GET(
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

  // Only the report owner or an admin can download
  const isOwner = report.auditSession.userId === session.user.id
  const isAdmin = session.user.role === "admin"
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const reportData = parseReportData(report.automationMap, report.implGuide)
    const userName = report.auditSession.user?.name || "User"
    const generatedAt = new Date(report.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(
      React.createElement(ReportPDF, { userName, generatedAt, data: reportData }) as any
    )

    const uint8 = new Uint8Array(buffer)
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="life-audit-report-${reportId.slice(0, 8)}.pdf"`,
        "Content-Length": uint8.length.toString(),
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("[PDF] Generation error:", err)
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 })
  }
}
