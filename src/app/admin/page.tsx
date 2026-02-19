import { prisma } from "@/lib/prisma"

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <p className="text-sm text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export default async function AdminOverviewPage() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [totalUsers, totalReports, completedSessions, thisWeekReports, inProgressSessions] =
    await Promise.all([
      prisma.user.count(),
      prisma.auditReport.count(),
      prisma.auditSession.count({ where: { status: "completed" } }),
      prisma.auditReport.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.auditSession.count({ where: { status: "in_progress" } }),
    ])

  const recentReports = await prisma.auditReport.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      auditSession: {
        include: { user: true },
      },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide stats and activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Users" value={totalUsers} sub="all time" />
        <StatCard label="Total Reports" value={totalReports} sub="completed audits" />
        <StatCard
          label="Completed Sessions"
          value={completedSessions}
          sub={`${inProgressSessions} in progress`}
        />
        <StatCard label="Reports This Week" value={thisWeekReports} sub="last 7 days" />
      </div>

      {/* Recent reports */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Reports</h2>
        {recentReports.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-500">
            No reports yet.
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Generated</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-slate-700/50 hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-4 py-3 text-white">
                      {report.auditSession.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {report.auditSession.user?.email}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/reports/${report.id}`}
                        className="text-cyan-400 hover:text-cyan-300 font-medium text-xs transition-colors"
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
