import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AuditStartClient from "./AuditStartClient"

export default async function AuditPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const inProgressSession = await prisma.auditSession.findFirst({
    where: { userId: session.user.id, status: "in_progress" },
    orderBy: { createdAt: "desc" },
  })

  return (
    <AuditStartClient
      inProgressSessionId={inProgressSession?.id ?? null}
      inProgressDomain={inProgressSession?.currentDomain ?? null}
    />
  )
}
