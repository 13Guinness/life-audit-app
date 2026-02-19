import Link from "next/link"

const domains = [
  { num: 1, name: "Primary Work / Career", icon: "💼" },
  { num: 2, name: "Side Hustle / Secondary Income", icon: "🚀" },
  { num: 3, name: "Personal Finance", icon: "💰" },
  { num: 4, name: "Health & Fitness", icon: "🏃" },
  { num: 5, name: "Personal Productivity & Daily Routines", icon: "⚡" },
  { num: 6, name: "Communication & Relationships", icon: "💬" },
  { num: 7, name: "Home & Lifestyle", icon: "🏠" },
  { num: 8, name: "Learning & Personal Development", icon: "📚" },
  { num: 9, name: "Content & Information Management", icon: "🗂️" },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-[#06b6d4] px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full animate-pulse" />
            AI-Powered Life Optimization
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Discover Every Way AI Can{" "}
            <span className="text-[#06b6d4]">Save You Time</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            Answer questions across 9 domains of your life. Our AI generates a personalized
            automation roadmap showing exactly where and how to reclaim hours every week.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-[#06b6d4] hover:bg-cyan-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              Start Your Free Life Audit →
            </Link>
            <Link
              href="/auth/signin"
              className="text-slate-400 hover:text-white text-base font-medium transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* 9 Domains Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">9 Domains. Complete Coverage.</h2>
            <p className="text-slate-400 text-lg">
              We analyze every area of your life to find automation opportunities.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <div
                key={domain.num}
                className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all"
              >
                <div className="flex-shrink-0 w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-2xl">
                  {domain.icon}
                </div>
                <div>
                  <div className="text-xs text-[#06b6d4] font-semibold mb-0.5 uppercase tracking-wide">
                    Domain {domain.num}
                  </div>
                  <div className="text-white font-medium text-sm leading-snug">{domain.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Answer Questions",
                desc: "Complete a short questionnaire across all 9 life domains. Takes 15–20 minutes.",
              },
              {
                step: "02",
                title: "AI Analyzes Your Life",
                desc: "Claude processes your answers and identifies every automation opportunity unique to you.",
              },
              {
                step: "03",
                title: "Get Your Roadmap",
                desc: "Receive a detailed implementation guide with tools, steps, and timeline — ready to act on.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-[#06b6d4] text-4xl font-bold mb-4">{item.step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/40">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Optimize Your Life?</h2>
          <p className="text-slate-400 text-lg mb-8">
            Stop leaving hours on the table. Get your personalized AI automation report today.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-[#06b6d4] hover:bg-cyan-400 text-white font-semibold px-10 py-4 rounded-xl text-xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            Get Your AI Audit Report →
          </Link>
        </div>
      </section>
    </main>
  )
}
