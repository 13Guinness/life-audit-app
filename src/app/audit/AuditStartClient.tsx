"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Props {
  inProgressSessionId: string | null
  inProgressDomain: number | null
}

export default function AuditStartClient({ inProgressSessionId, inProgressDomain }: Props) {
  const router = useRouter()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startAudit() {
    setStarting(true)
    setError(null)
    try {
      const res = await fetch("/api/audit/start", { method: "POST" })
      if (!res.ok) throw new Error("Failed to start audit")
      const { sessionId } = await res.json()
      router.push(`/audit/${sessionId}`)
    } catch {
      setError("Something went wrong. Please try again.")
      setStarting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-[#06b6d4] px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full" />
            AI Life Audit
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {inProgressSessionId
              ? "Welcome Back"
              : "Ready to Discover Your Automation Roadmap?"}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            {inProgressSessionId
              ? "You have an audit in progress. Pick up where you left off, or start fresh."
              : "Answer questions across 9 life domains. Takes about 15–20 minutes. Claude will generate your personalized automation report."}
          </p>
        </div>

        {/* Domain preview */}
        {!inProgressSessionId && (
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { icon: "💼", name: "Work" },
              { icon: "💰", name: "Finance" },
              { icon: "🏃", name: "Health" },
              { icon: "⚡", name: "Productivity" },
              { icon: "💬", name: "Communication" },
              { icon: "🏠", name: "Home" },
              { icon: "🚀", name: "Side Hustle" },
              { icon: "📚", name: "Learning" },
              { icon: "🗂️", name: "Information" },
            ].map((d) => (
              <div
                key={d.name}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-2"
              >
                <span className="text-xl">{d.icon}</span>
                <span className="text-slate-300 text-sm font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* In-progress banner */}
        {inProgressSessionId && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <div className="text-[#06b6d4] font-semibold mb-1">Audit In Progress</div>
              <div className="text-slate-400 text-sm">
                You&apos;re on domain {inProgressDomain} of 9 — keep going!
              </div>
            </div>
            <Link
              href={`/audit/${inProgressSessionId}`}
              className="bg-[#06b6d4] hover:bg-cyan-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Continue →
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Start button */}
        <button
          onClick={startAudit}
          disabled={starting}
          className="w-full bg-[#06b6d4] hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-lg shadow-cyan-500/10"
        >
          {starting
            ? "Starting..."
            : inProgressSessionId
            ? "Start New Audit Instead"
            : "Start My AI Life Audit →"}
        </button>

        {inProgressSessionId && (
          <p className="text-center text-slate-500 text-sm mt-4">
            Starting new will create a separate audit session.
          </p>
        )}
      </div>
    </main>
  )
}
