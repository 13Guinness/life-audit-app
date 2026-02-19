import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import AuditQuestionnaire from "@/components/questionnaire/AuditQuestionnaire"

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function AuditSessionPage({ params }: Props) {
  const { sessionId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const auditSession = await prisma.auditSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: { responses: true, report: true },
  })

  if (!auditSession) notFound()

  // If already completed, redirect to the report
  if (auditSession.status === "completed" && auditSession.report) {
    redirect(`/report/${auditSession.report.id}`)
  }

  // Parse saved responses into Record<domain, Record<question, answer>>
  const initialResponses: Record<number, Record<string, string>> = {}
  for (const r of auditSession.responses) {
    try {
      initialResponses[r.domain] = JSON.parse(r.answers) as Record<string, string>
    } catch {
      initialResponses[r.domain] = {}
    }
  }

  return (
    <AuditQuestionnaire
      sessionId={auditSession.id}
      initialDomain={auditSession.currentDomain}
      initialResponses={initialResponses}
      initialStatus={auditSession.status}
    />
  )
}
