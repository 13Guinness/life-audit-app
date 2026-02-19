import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportData } from "@/lib/claude";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId } = await params;

  const report = await prisma.auditReport.findUnique({
    where: { id: reportId },
    include: {
      auditSession: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const isOwner = report.auditSession.user.id === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reportData: ReportData = JSON.parse(report.automationMap);

  return NextResponse.json({
    id: report.id,
    createdAt: report.createdAt,
    emailedAt: report.emailedAt,
    pdfPath: report.pdfPath,
    user: report.auditSession.user,
    ...reportData,
  });
}
