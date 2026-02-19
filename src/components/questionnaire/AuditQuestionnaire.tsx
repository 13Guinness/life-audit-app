"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DOMAINS } from "@/lib/domains"

interface Props {
  sessionId: string
  initialDomain: number
  initialResponses: Record<number, Record<string, string>>
  initialStatus: string
}

export default function AuditQuestionnaire({
  sessionId,
  initialDomain,
  initialResponses,
  initialStatus,
}: Props) {
  const router = useRouter()
  const [currentDomain, setCurrentDomain] = useState(initialDomain)
  const [responses, setResponses] = useState<Record<number, Record<string, string>>>(initialResponses)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(initialStatus === "generating")
  const [showSummary, setShowSummary] = useState(false)
  const [error, setError] = useState("")

  const domain = DOMAINS.find((d) => d.id === currentDomain)
  const isLastDomain = currentDomain === 9
  const currentAnswers = responses[currentDomain] || {}

  // Poll for completion when generating
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/audit/${sessionId}/status`)
      const data = await res.json()
      if (data.status === "completed" && data.reportId) {
        router.push(`/report/${data.reportId}`)
      } else if (data.status === "failed") {
        setGenerating(false)
        setError("Report generation failed. Please try again.")
      }
    } catch {
      // keep polling
    }
  }, [sessionId, router])

  useEffect(() => {
    if (!generating) return
    const interval = setInterval(pollStatus, 3000)
    return () => clearInterval(interval)
  }, [generating, pollStatus])

  const updateAnswer = (question: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentDomain]: { ...(prev[currentDomain] || {}), [question]: value },
    }))
  }

  const saveAndContinue = async () => {
    setSaving(true)
    setError("")
    try {
      const answers = responses[currentDomain] || {}
      await fetch(`/api/audit/${sessionId}/response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: currentDomain, answers }),
      })

      if (isLastDomain) {
        setShowSummary(true)
      } else {
        setCurrentDomain((d) => d + 1)
      }
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    setError("")
    try {
      await fetch(`/api/audit/${sessionId}/generate`, { method: "POST" })
    } catch {
      setError("Failed to start generation. Please try again.")
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Generating Your Report</h2>
          <p className="text-slate-400 mb-2">
            Claude is analyzing your life audit across all 9 domains...
          </p>
          <p className="text-slate-500 text-sm">This takes 30–60 seconds. Don&apos;t close this tab.</p>
        </div>
      </div>
    )
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-4xl mb-3">✅</div>
            <h1 className="text-3xl font-bold text-white mb-2">Audit Complete</h1>
            <p className="text-slate-400">
              All 9 domains covered. Review your answers below, then generate your report.
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {DOMAINS.map((d) => {
              const domainAnswers = responses[d.id] || {}
              const hasAnswers = Object.values(domainAnswers).some((v) => v.trim())
              return (
                <div key={d.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{d.icon}</span>
                    <h3 className="font-semibold text-white">{d.name}</h3>
                    {!hasAnswers && (
                      <span className="ml-auto text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        Skipped
                      </span>
                    )}
                  </div>
                  {hasAnswers && (
                    <div className="space-y-2">
                      {d.questions.map((q) => {
                        const ans = domainAnswers[q]
                        if (!ans?.trim()) return null
                        return (
                          <div key={q}>
                            <p className="text-xs text-slate-500 mb-1">{q}</p>
                            <p className="text-sm text-slate-300">{ans}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <div className="text-center">
            <button
              onClick={generateReport}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-10 py-4 rounded-xl text-lg transition-colors"
            >
              Generate My Report →
            </button>
            <p className="text-slate-500 text-sm mt-3">Takes 30–60 seconds</p>
          </div>
        </div>
      </div>
    )
  }

  if (!domain) return null

  const progress = Math.round(((currentDomain - 1) / 9) * 100)

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Domain {currentDomain} of 9</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Domain Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{domain.icon}</span>
            <h1 className="text-2xl font-bold text-white">{domain.name}</h1>
          </div>
          <p className="text-slate-400">{domain.description}</p>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {domain.questions.map((question, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {question}
              </label>
              <textarea
                value={currentAnswers[question] || ""}
                onChange={(e) => updateAnswer(question, e.target.value)}
                rows={3}
                placeholder="Take your time — the more detail, the better your recommendations..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none transition-colors"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {currentDomain > 1 ? (
            <button
              onClick={() => setCurrentDomain((d) => d - 1)}
              className="text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={saveAndContinue}
            disabled={saving}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            {saving ? "Saving..." : isLastDomain ? "Review & Generate →" : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  )
}
