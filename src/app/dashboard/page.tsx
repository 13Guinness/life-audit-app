import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

const statusColors: Record<string, string> = {
  in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  generating: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  in_progress: "In Progress",
  generating: "Generating",
  completed: "Completed",
  failed: "Failed",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/signin")

  const userId = session.user.id

  const auditSessions = await prisma.auditSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { report: true },
  })

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Audits</h1>
            <p className="text-slate-400 mt-1">
              {session.user.name ? `Welcome back, ${session.user.name}` : "Manage your AI life audit sessions"}
            </p>
          </div>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-[#06b6d4] hover:bg-cyan-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors self-start sm:self-auto"
          >
            + Start New Audit
          </Link>
        </div>

        {/* Empty state */}
        {auditSessions.length === 0 ? (
          <div className="text-center py-24 bg-slate-800/40 border border-slate-700 rounded-2xl">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-xl font-semibold text-white mb-2">No audits yet</h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
              Start your first AI life audit to discover personalized automation opportunities.
            </p>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 bg-[#06b6d4] hover:bg-cyan-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Start Your First Audit →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {auditSessions.map((s) => (
              <div
                key={s.id}
                className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-white font-semibold">
                      Audit — {formatDate(s.createdAt)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[s.status] ?? ""}`}
                    >
                      {statusLabels[s.status] ?? s.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {s.status === "in_progress"
                      ? `Domain ${s.currentDomain} of 9 complete`
                      : s.status === "generating"
                      ? "AI is generating your report…"
                      : s.status === "completed" && s.completedAt
                      ? `Completed ${formatDate(s.completedAt)}`
                      : s.status === "failed"
                      ? "Generation failed — try again"
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {s.status === "in_progress" && (
                    <Link
                      href={`/audit/${s.id}`}
                      className="text-[#06b6d4] hover:text-cyan-300 font-medium text-sm transition-colors"
                    >
                      Continue →
                    </Link>
                  )}
                  {s.status === "completed" && s.report && (
                    <>
                      <Link
                        href={`/report/${s.report.id}`}
                        className="bg-[#06b6d4] hover:bg-cyan-400 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                      >
                        View Report
                      </Link>
                      <a
                        href={`/api/report/${s.report.id}/pdf`}
                        className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                      >
                        Download PDF
                      </a>
                    </>
                  )}
                  {s.status === "generating" && (
                    <span className="text-blue-400 text-sm flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Generating…
                    </span>
                  )}
                  {s.status === "failed" && (
                    <Link
                      href={`/audit/${s.id}`}
                      className="border border-red-500/30 text-red-400 hover:text-red-300 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Retry
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
