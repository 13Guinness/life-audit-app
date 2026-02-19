import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAuditReport } from "@/lib/claude";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  // Load audit session and verify ownership
  const auditSession = await prisma.auditSession.findUnique({
    where: { id: sessionId },
    include: { responses: true },
  });

  if (!auditSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (auditSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (auditSession.responses.length === 0) {
    return NextResponse.json(
      { error: "No responses found for this session" },
      { status: 400 }
    );
  }

  // Mark session as generating
  await prisma.auditSession.update({
    where: { id: sessionId },
    data: { status: "generating" },
  });

  try {
    const domainAnswers = auditSession.responses.map((r) => ({
      domain: r.domain,
      answers: r.answers,
    }));

    const reportData = await generateAuditReport(domainAnswers);

    // Persist: store full ReportData in automationMap, implGuide separately
    const report = await prisma.auditReport.create({
      data: {
        auditSessionId: sessionId,
        automationMap: JSON.stringify(reportData),
        implGuide: JSON.stringify(reportData.implementationGuide),
      },
    });

    await prisma.auditSession.update({
      where: { id: sessionId },
      data: { status: "completed", completedAt: new Date() },
    });

    return NextResponse.json({ reportId: report.id });
  } catch (err) {
    console.error("[generate] Claude error:", err);

    await prisma.auditSession.update({
      where: { id: sessionId },
      data: { status: "failed" },
    });

    return NextResponse.json(
      { error: "Report generation failed" },
      { status: 500 }
    );
  }
}
