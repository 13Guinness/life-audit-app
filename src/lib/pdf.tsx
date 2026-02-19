import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Opportunity {
  task: string
  opportunity: string
  timeSaved: string
  difficulty: string
  cost: string
  impact: string
}

export interface DomainMap {
  domain: string
  domainNumber: number
  opportunities: Opportunity[]
}

export interface QuickWin {
  rank: number
  task: string
  description: string
  timeSaved: string
}

export interface Automation {
  what: string
  why: string
  tools: string[]
  steps: string[]
  proTip: string
  setupTime: string
  maintenance: string
}

export interface ImplDomain {
  domain: string
  automations: Automation[]
}

export interface ImplementationOrder {
  week1_2: string[]
  week3_4: string[]
  month2: string[]
  month3plus: string[]
}

export interface ReportData {
  summary: string
  automationMap: DomainMap[]
  topQuickWins: QuickWin[]
  implementationGuide: ImplDomain[]
  implementationOrder: ImplementationOrder
}

// ─── Data Parser ──────────────────────────────────────────────────────────────

export function parseReportData(
  automationMapStr: string,
  implGuideStr: string
): ReportData {
  let mapData: any = {}
  let guideData: any = {}
  try {
    mapData = JSON.parse(automationMapStr)
  } catch {}
  try {
    guideData = JSON.parse(implGuideStr)
  } catch {}

  return {
    summary: mapData.summary || guideData.summary || "",
    automationMap: mapData.automationMap || (Array.isArray(mapData) ? mapData : []),
    topQuickWins: mapData.topQuickWins || guideData.topQuickWins || [],
    implementationGuide:
      guideData.implementationGuide ||
      mapData.implementationGuide ||
      (Array.isArray(guideData) ? guideData : []),
    implementationOrder: mapData.implementationOrder ||
      guideData.implementationOrder || {
        week1_2: [],
        week3_4: [],
        month2: [],
        month3plus: [],
      },
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 52,
    paddingRight: 52,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#222",
    backgroundColor: "#fff",
  },

  // Cover
  coverWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverTitle: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  coverRule: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    width: 80,
    marginBottom: 20,
    marginTop: 8,
  },
  coverFor: { fontSize: 14, textAlign: "center", marginBottom: 6, color: "#333" },
  coverDate: { fontSize: 11, textAlign: "center", color: "#777" },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  domainTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 6,
  },

  // Body
  body: { fontSize: 10, lineHeight: 1.6, color: "#333", marginBottom: 6 },
  statRow: { flexDirection: "row", marginBottom: 4 },
  statBullet: { width: 14, fontSize: 10, color: "#333" },
  statText: { flex: 1, fontSize: 10, color: "#333" },

  // Table
  thead: { flexDirection: "row", backgroundColor: "#111" },
  trow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  trowAlt: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    backgroundColor: "#f6f6f6",
  },
  thWide: {
    width: "25%",
    padding: 4,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
  },
  thMid: {
    width: "30%",
    padding: 4,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
  },
  thSm: {
    width: "15%",
    padding: 4,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
    textAlign: "center",
  },
  tdWide: { width: "25%", padding: 4, fontSize: 8, color: "#222" },
  tdMid: { width: "30%", padding: 4, fontSize: 8, color: "#222" },
  tdSm: { width: "15%", padding: 4, fontSize: 8, color: "#222", textAlign: "center" },

  // Quick wins
  qwRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#000",
    paddingLeft: 10,
  },
  qwRank: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#ccc",
    width: 34,
    paddingTop: 2,
  },
  qwTask: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  qwDesc: { fontSize: 9, color: "#555", marginBottom: 3 },
  qwTime: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333" },

  // Impl card
  implCard: {
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#ccc",
    padding: 10,
  },
  implWhat: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  implLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#666",
    marginTop: 5,
    marginBottom: 2,
  },
  implText: { fontSize: 9, color: "#333", lineHeight: 1.4 },
  implStep: { fontSize: 9, color: "#333", lineHeight: 1.4, marginBottom: 2 },
  implTip: {
    fontSize: 9,
    color: "#333",
    backgroundColor: "#f4f4f4",
    padding: 6,
    borderLeftWidth: 2,
    borderLeftColor: "#000",
    marginTop: 4,
  },
  implMeta: { flexDirection: "row", marginTop: 6 },
  implMetaItem: { fontSize: 8, color: "#777", marginRight: 20 },

  // Timeline
  tPhase: { marginBottom: 18 },
  tPhaseHead: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tItem: { fontSize: 9, color: "#333", marginBottom: 3, paddingLeft: 10 },
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function CoverPage({ userName, generatedAt }: { userName: string; generatedAt: string }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.coverWrap}>
        <Text style={s.coverTitle}>AI Life Audit Report</Text>
        <View style={s.coverRule} />
        <Text style={s.coverFor}>Prepared for {userName}</Text>
        <Text style={s.coverDate}>Generated {generatedAt}</Text>
      </View>
    </Page>
  )
}

function SummaryPage({ data }: { data: ReportData }) {
  const totalOpps = (data.automationMap || []).reduce(
    (n, d) => n + (d.opportunities?.length || 0),
    0
  )
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.sectionTitle}>Executive Summary</Text>
      <Text style={s.body}>{data.summary || "No summary available."}</Text>
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 8 }}>
          Report Overview
        </Text>
        {[
          `Domains analyzed: ${data.automationMap?.length || 0}`,
          `Total automation opportunities: ${totalOpps}`,
          `Quick wins identified: ${data.topQuickWins?.length || 0}`,
          `Implementation phases: 4 (Weeks 1–2, 3–4, Month 2, Month 3+)`,
        ].map((line, i) => (
          <View key={i} style={s.statRow}>
            <Text style={s.statBullet}>•</Text>
            <Text style={s.statText}>{line}</Text>
          </View>
        ))}
      </View>
    </Page>
  )
}

function AutomationMapPage({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.sectionTitle}>Automation Map</Text>
      {(data.automationMap || []).map((domain, di) => (
        <View key={di} style={{ marginBottom: 18 }}>
          <Text style={s.domainTitle}>
            Domain {domain.domainNumber}: {domain.domain}
          </Text>
          <View style={s.thead}>
            <Text style={s.thWide}>Task</Text>
            <Text style={s.thMid}>Opportunity</Text>
            <Text style={s.thSm}>Time Saved</Text>
            <Text style={s.thSm}>Difficulty</Text>
            <Text style={s.thSm}>Impact</Text>
          </View>
          {(domain.opportunities || []).map((opp, oi) => (
            <View key={oi} style={oi % 2 === 0 ? s.trow : s.trowAlt} wrap={false}>
              <Text style={s.tdWide}>{opp.task}</Text>
              <Text style={s.tdMid}>{opp.opportunity}</Text>
              <Text style={s.tdSm}>{opp.timeSaved}</Text>
              <Text style={s.tdSm}>{opp.difficulty}</Text>
              <Text style={s.tdSm}>{opp.impact}</Text>
            </View>
          ))}
        </View>
      ))}
    </Page>
  )
}

function QuickWinsPage({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.sectionTitle}>Top 10 Quick Wins</Text>
      {(data.topQuickWins || []).slice(0, 10).map((win, i) => (
        <View key={i} style={s.qwRow} wrap={false}>
          <Text style={s.qwRank}>#{win.rank ?? i + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.qwTask}>{win.task}</Text>
            <Text style={s.qwDesc}>{win.description}</Text>
            <Text style={s.qwTime}>Time saved: {win.timeSaved}</Text>
          </View>
        </View>
      ))}
    </Page>
  )
}

function ImplGuidePage({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.sectionTitle}>Implementation Guide</Text>
      {(data.implementationGuide || []).map((domain, di) => (
        <View key={di}>
          <Text style={s.domainTitle}>{domain.domain}</Text>
          {(domain.automations || []).map((auto, ai) => (
            <View key={ai} style={s.implCard} wrap={false}>
              <Text style={s.implWhat}>{auto.what}</Text>
              <Text style={s.implLabel}>WHY</Text>
              <Text style={s.implText}>{auto.why}</Text>
              <Text style={s.implLabel}>TOOLS</Text>
              <Text style={s.implText}>{(auto.tools || []).join(" · ")}</Text>
              <Text style={s.implLabel}>STEPS</Text>
              {(auto.steps || []).map((step, si) => (
                <Text key={si} style={s.implStep}>
                  {si + 1}. {step}
                </Text>
              ))}
              {auto.proTip ? (
                <>
                  <Text style={s.implLabel}>PRO TIP</Text>
                  <Text style={s.implTip}>{auto.proTip}</Text>
                </>
              ) : null}
              <View style={s.implMeta}>
                <Text style={s.implMetaItem}>Setup: {auto.setupTime}</Text>
                <Text style={s.implMetaItem}>Maintenance: {auto.maintenance}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </Page>
  )
}

function TimelinePage({ data }: { data: ReportData }) {
  const order = data.implementationOrder || {}
  const phases: Array<{ label: string; key: keyof ImplementationOrder; fallback: string }> = [
    { label: "Weeks 1–2: Quick Wins", key: "week1_2", fallback: "Begin with highest-impact, lowest-effort automations." },
    { label: "Weeks 3–4: Building Momentum", key: "week3_4", fallback: "Layer in medium-complexity workflows." },
    { label: "Month 2: Intermediate Automations", key: "month2", fallback: "Expand into multi-step workflows." },
    { label: "Month 3+: Advanced Systems", key: "month3plus", fallback: "Deploy advanced AI systems and integrations." },
  ]
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.sectionTitle}>Implementation Timeline</Text>
      {phases.map((phase) => {
        const items: string[] = order[phase.key] || []
        return (
          <View key={phase.key} style={s.tPhase}>
            <Text style={s.tPhaseHead}>{phase.label}</Text>
            {items.length > 0
              ? items.map((item, i) => (
                  <Text key={i} style={s.tItem}>
                    • {item}
                  </Text>
                ))
              : <Text style={s.tItem}>{phase.fallback}</Text>}
          </View>
        )
      })}
    </Page>
  )
}

// ─── Main Document ────────────────────────────────────────────────────────────

interface ReportPDFProps {
  userName: string
  generatedAt: string
  data: ReportData
}

export function ReportPDF({ userName, generatedAt, data }: ReportPDFProps) {
  return (
    <Document title="AI Life Audit Report" author="LifeAudit AI">
      <CoverPage userName={userName} generatedAt={generatedAt} />
      <SummaryPage data={data} />
      <AutomationMapPage data={data} />
      <QuickWinsPage data={data} />
      <ImplGuidePage data={data} />
      <TimelinePage data={data} />
    </Document>
  )
}
