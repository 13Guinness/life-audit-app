import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type {
  ReportData,
  DomainAutomation,
  AutomationOpportunity,
  QuickWin,
  ImplementationGuide,
  ImplementationAutomation,
} from "@/lib/claude";
import ReportActions from "./ReportActions";

// ─── Badge color maps ─────────────────────────────────────────────────────────

const IMPACT_STYLES: Record<string, string> = {
  Transformative:
    "bg-violet-500/20 text-violet-300 border border-violet-500/40 ring-1 ring-violet-500/20",
  High: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  Medium: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
  Low: "bg-slate-600/40 text-slate-400 border border-slate-600",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50",
  Medium: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
  Hard: "bg-red-900/60 text-red-300 border border-red-700/50",
};

const COST_STYLES: Record<string, string> = {
  Free: "bg-emerald-900/60 text-emerald-400 border border-emerald-700/50",
  Low: "bg-teal-900/60 text-teal-300 border border-teal-700/50",
  Medium: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
  High: "bg-red-900/60 text-red-300 border border-red-700/50",
};

const TIMELINE_PHASES = [
  {
    key: "week1_2" as const,
    label: "Phase 1",
    period: "Week 1–2",
    from: "from-cyan-950",
    to: "to-slate-900",
    border: "border-cyan-800/50",
    accent: "text-cyan-400",
    dot: "bg-cyan-500",
    num: "bg-cyan-500/20 text-cyan-300",
  },
  {
    key: "week3_4" as const,
    label: "Phase 2",
    period: "Week 3–4",
    from: "from-blue-950",
    to: "to-slate-900",
    border: "border-blue-800/50",
    accent: "text-blue-400",
    dot: "bg-blue-500",
    num: "bg-blue-500/20 text-blue-300",
  },
  {
    key: "month2" as const,
    label: "Phase 3",
    period: "Month 2",
    from: "from-violet-950",
    to: "to-slate-900",
    border: "border-violet-800/50",
    accent: "text-violet-400",
    dot: "bg-violet-500",
    num: "bg-violet-500/20 text-violet-300",
  },
  {
    key: "month3plus" as const,
    label: "Phase 4",
    period: "Month 3+",
    from: "from-emerald-950",
    to: "to-slate-900",
    border: "border-emerald-800/50",
    accent: "text-emerald-400",
    dot: "bg-emerald-500",
    num: "bg-emerald-500/20 text-emerald-300",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Badge({
  text,
  className,
}: {
  text: string;
  className: string | undefined;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${className ?? "bg-slate-700 text-slate-300 border border-slate-600"}`}
    >
      {text}
    </span>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
        {icon}
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="hidden sm:block flex-1 max-w-48 h-px bg-gradient-to-r from-slate-700 to-transparent" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

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

  if (!report) notFound();

  const isOwner = report.auditSession.user.id === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) redirect("/dashboard");

  const reportData: ReportData = JSON.parse(report.automationMap);
  const {
    summary,
    automationMap,
    topQuickWins,
    implementationGuide,
    implementationOrder,
  } = reportData;

  const user = report.auditSession.user;
  const dateStr = new Date(report.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalOpportunities = automationMap.reduce(
    (sum, d) => sum + d.opportunities.length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-cyan-400 font-bold text-lg tracking-tight hidden sm:block">
              Life Audit
            </span>
            <span className="text-slate-600 hidden sm:block">·</span>
            <div className="min-w-0">
              <p className="text-slate-200 font-medium text-sm truncate">
                {user.name ?? user.email}
              </p>
              <p className="text-slate-500 text-xs">{dateStr}</p>
            </div>
          </div>
          <ReportActions reportId={reportId} />
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            AI Automation Report
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Automation Roadmap
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            {summary}
          </p>
          {/* Stat strip */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              {
                value: automationMap.length,
                label: "Domains Analyzed",
                color: "text-cyan-400",
              },
              {
                value: totalOpportunities,
                label: "Opportunities Found",
                color: "text-blue-400",
              },
              {
                value: topQuickWins.length,
                label: "Quick Wins",
                color: "text-violet-400",
              },
              {
                value: implementationGuide.length,
                label: "Implementation Plans",
                color: "text-emerald-400",
              },
            ].map(({ value, label, color }) => (
              <div key={label}>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* ── Section 1: Automation Map ── */}
        <section>
          <SectionHeader
            icon="⚡"
            title="Automation Map"
            subtitle="Every opportunity identified across your life domains"
          />

          <div className="space-y-5 mt-7">
            {automationMap.map((domain: DomainAutomation) => (
              <div
                key={domain.domainNumber}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl shadow-black/20"
              >
                {/* Domain header */}
                <div className="px-5 py-3.5 bg-slate-800/70 border-b border-slate-700/60 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/20 border border-cyan-700/40 flex items-center justify-center text-cyan-300 text-xs font-bold flex-shrink-0">
                    {domain.domainNumber}
                  </span>
                  <h3 className="font-semibold text-slate-100 flex-1">
                    {domain.domain}
                  </h3>
                  <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                    {domain.opportunities.length}{" "}
                    {domain.opportunities.length === 1
                      ? "opportunity"
                      : "opportunities"}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                        <th className="text-left px-5 py-3 font-medium">
                          Task
                        </th>
                        <th className="text-left px-5 py-3 font-medium">
                          What AI Can Do
                        </th>
                        <th className="text-left px-5 py-3 font-medium whitespace-nowrap">
                          Time Saved
                        </th>
                        <th className="text-left px-5 py-3 font-medium">
                          Difficulty
                        </th>
                        <th className="text-left px-5 py-3 font-medium">
                          Cost
                        </th>
                        <th className="text-left px-5 py-3 font-medium">
                          Impact
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {domain.opportunities.map(
                        (opp: AutomationOpportunity, i: number) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-800/30 transition-colors group"
                          >
                            <td className="px-5 py-3.5 font-medium text-slate-200 max-w-[180px]">
                              {opp.task}
                            </td>
                            <td className="px-5 py-3.5 text-slate-400 max-w-xs leading-relaxed">
                              {opp.opportunity}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="font-mono text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-800/40 px-2 py-0.5 rounded">
                                {opp.timeSaved}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge
                                text={opp.difficulty}
                                className={DIFFICULTY_STYLES[opp.difficulty]}
                              />
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge
                                text={opp.cost}
                                className={COST_STYLES[opp.cost]}
                              />
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge
                                text={opp.impact}
                                className={IMPACT_STYLES[opp.impact]}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Top Quick Wins ── */}
        <section>
          <SectionHeader
            icon="🚀"
            title="Top Quick Wins"
            subtitle="Highest-impact, lowest-friction automations to start immediately"
          />

          <div className="grid gap-4 mt-7 sm:grid-cols-2">
            {topQuickWins.map((win: QuickWin) => (
              <div
                key={win.rank}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex gap-4 hover:border-slate-700 transition-colors overflow-hidden"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/5 group-hover:to-violet-500/5 transition-all pointer-events-none rounded-2xl" />

                {/* Rank badge */}
                <div className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-cyan-500/20">
                  {win.rank}
                </div>

                {/* Content */}
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="font-semibold text-slate-100 leading-snug">
                      {win.task}
                    </h4>
                    <span className="flex-shrink-0 text-xs font-mono text-emerald-400 bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-800/50 whitespace-nowrap">
                      {win.timeSaved}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {win.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Implementation Guide ── */}
        <section>
          <SectionHeader
            icon="📖"
            title="Implementation Guide"
            subtitle="Step-by-step playbooks for every automation"
          />

          <div className="space-y-3 mt-7">
            {implementationGuide.map((guide: ImplementationGuide, i: number) => (
              <details
                key={i}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg shadow-black/10 open:border-slate-700"
              >
                <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-800/40 transition-colors select-none list-none">
                  <span className="w-2 h-2 rounded-full bg-slate-600 group-open:bg-cyan-400 transition-colors flex-shrink-0" />
                  <span className="font-semibold text-slate-200 flex-1 group-open:text-cyan-300 transition-colors">
                    {guide.domain}
                  </span>
                  <span className="text-xs text-slate-600 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                    {guide.automations.length}{" "}
                    {guide.automations.length === 1
                      ? "automation"
                      : "automations"}
                  </span>
                  <svg
                    className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>

                <div className="border-t border-slate-800">
                  {guide.automations.map(
                    (auto: ImplementationAutomation, j: number) => (
                      <div
                        key={j}
                        className={`p-6 ${j > 0 ? "border-t border-slate-800/60" : ""}`}
                      >
                        <div className="grid md:grid-cols-2 gap-7">
                          {/* Left column */}
                          <div className="space-y-5">
                            <div>
                              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1.5">
                                What
                              </div>
                              <p className="text-slate-200 leading-relaxed">
                                {auto.what}
                              </p>
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1.5">
                                Why
                              </div>
                              <p className="text-slate-400 leading-relaxed">
                                {auto.why}
                              </p>
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">
                                Tools
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {auto.tools.map((tool, k) => (
                                  <span
                                    key={k}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs pt-1">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Setup:{" "}
                                <span className="text-slate-300 font-medium">
                                  {auto.setupTime}
                                </span>
                              </div>
                              <span className="text-slate-700">·</span>
                              <div className="text-slate-500">
                                Maintenance:{" "}
                                <span className="text-slate-300 font-medium">
                                  {auto.maintenance}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right column */}
                          <div className="space-y-5">
                            <div>
                              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
                                Steps
                              </div>
                              <ol className="space-y-2.5">
                                {auto.steps.map((step, k) => (
                                  <li key={k} className="flex gap-3 text-sm">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 flex items-center justify-center text-xs font-bold mt-0.5">
                                      {k + 1}
                                    </span>
                                    <span className="text-slate-300 leading-relaxed">
                                      {step}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <div className="rounded-xl bg-amber-900/15 border border-amber-700/30 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-base">💡</span>
                                <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                                  Pro Tip
                                </span>
                              </div>
                              <p className="text-sm text-amber-200/80 leading-relaxed">
                                {auto.proTip}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Section 4: Implementation Timeline ── */}
        <section>
          <SectionHeader
            icon="📅"
            title="Implementation Timeline"
            subtitle="Your personalized roadmap from quick wins to full automation"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
            {TIMELINE_PHASES.map((phase) => {
              const items = implementationOrder[phase.key] ?? [];
              return (
                <div
                  key={phase.key}
                  className={`rounded-2xl border ${phase.border} overflow-hidden`}
                >
                  {/* Phase header */}
                  <div
                    className={`bg-gradient-to-br ${phase.from} ${phase.to} px-4 py-4 border-b ${phase.border}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${phase.num} text-xs font-medium mb-1`}
                    >
                      {phase.label}
                    </div>
                    <div className="text-slate-100 font-bold text-lg">
                      {phase.period}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-slate-900/60 p-4">
                    {items.length > 0 ? (
                      <ul className="space-y-2.5">
                        {items.map((item: string, i: number) => (
                          <li key={i} className="flex gap-2.5 text-sm">
                            <span
                              className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${phase.dot} mt-2`}
                            />
                            <span className="text-slate-300 leading-relaxed">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-600 text-sm italic">
                        No tasks for this phase
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 mt-8 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            Life Audit AI · Generated {dateStr}
          </span>
          <div className="flex items-center gap-3">
            <a
              href={`/api/report/${reportId}/pdf`}
              className="hover:text-slate-400 transition-colors"
            >
              Download PDF
            </a>
            <span>·</span>
            <a href="/dashboard" className="hover:text-slate-400 transition-colors">
              My Reports
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
