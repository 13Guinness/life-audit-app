import { prisma } from "@/lib/prisma"
import Link from "next/link"

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-400/10 text-green-400",
  in_progress: "bg-blue-400/10 text-blue-400",
  generating: "bg-yellow-400/10 text-yellow-400",
  failed: "bg-red-400/10 text-red-400",
}

export default async function AdminReportsPage() {
  const sessions = await prisma.auditSession.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      report: true,
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">All Reports</h1>
        <p className="text-slate-400 text-sm mt-1">{sessions.length} audit sessions</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">User</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Started</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Completed</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-white font-medium">{session.user?.name || "—"}</div>
                  <div className="text-slate-500 text-xs">{session.user?.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(session.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {session.completedAt
                    ? new Date(session.completedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[session.status] || "bg-slate-700 text-slate-400"}`}>
                    {session.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {session.report && (
                      <>
                        <Link
                          href={`/admin/reports/${session.report.id}`}
                          className="text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
                        >
                          View
                        </Link>
                        <a
                          href={`/api/report/${session.report.id}/pdf`}
                          className="text-slate-400 hover:text-white text-xs transition-colors"
                        >
                          PDF
                        </a>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sessions.length === 0 && (
          <div className="p-8 text-center text-slate-500">No sessions yet.</div>
        )}
      </div>
    </div>
  )
}
