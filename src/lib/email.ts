import { Resend } from "resend"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { prisma } from "@/lib/prisma"
import { ReportPDF, parseReportData } from "@/lib/pdf"

const FROM = process.env.EMAIL_FROM || "LifeAudit AI <onboarding@resend.dev>"

export async function sendReportEmail(
  email: string,
  name: string,
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  // Load the report from DB
  const report = await prisma.auditReport.findUnique({
    where: { id: reportId },
    include: {
      auditSession: {
        include: { user: true },
      },
    },
  })

  if (!report) {
    return { success: false, error: "Report not found" }
  }

  const reportData = parseReportData(report.automationMap, report.implGuide)
  const userName = name || report.auditSession?.user?.name || "there"
  const generatedAt = new Date(report.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (!process.env.RESEND_API_KEY) {
    console.log(
      `[Email] RESEND_API_KEY not set — would send report ${reportId} to ${email} (${userName})`
    )
    return { success: true }
  }

  // Generate PDF buffer
  let pdfBuffer: Buffer
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfBuffer = await renderToBuffer(
      React.createElement(ReportPDF, { userName, generatedAt, data: reportData }) as any
    )
  } catch (err) {
    console.error("[Email] PDF generation failed:", err)
    return { success: false, error: "PDF generation failed" }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3003"
  const downloadUrl = `${baseUrl}/api/report/${reportId}/pdf`

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #0f172a;">
        Your AI Life Audit Report is Ready
      </h1>
      <p style="color: #475569; margin-bottom: 24px;">Hi ${userName},</p>
      <p style="color: #334155; line-height: 1.6; margin-bottom: 16px;">
        Your personalized AI automation roadmap is ready. We've analyzed all 9 domains of your life and identified
        your highest-leverage automation opportunities, ranked by impact and ease of implementation.
      </p>
      <p style="color: #334155; line-height: 1.6; margin-bottom: 24px;">
        Your report is attached to this email as a PDF. You can also download it anytime from the link below.
      </p>
      <a href="${downloadUrl}"
         style="display: inline-block; background: #06b6d4; color: white; text-decoration: none;
                padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Download Report
      </a>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #94a3b8;">
        LifeAudit AI · Your personal automation strategist
      </p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "Your AI Life Audit Report is ready",
      html,
      attachments: [
        {
          filename: `life-audit-report-${reportId.slice(0, 8)}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    if (error) {
      console.error("[Email] Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("[Email] Send failed:", err)
    return { success: false, error: err?.message || "Unknown error" }
  }
}
