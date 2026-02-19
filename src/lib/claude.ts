import Anthropic from "@anthropic-ai/sdk";

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export interface AutomationOpportunity {
  task: string;
  opportunity: string;
  timeSaved: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cost: "Free" | "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High" | "Transformative";
}

export interface DomainAutomation {
  domain: string;
  domainNumber: number;
  opportunities: AutomationOpportunity[];
}

export interface QuickWin {
  rank: number;
  task: string;
  description: string;
  timeSaved: string;
}

export interface ImplementationAutomation {
  what: string;
  why: string;
  tools: string[];
  steps: string[];
  proTip: string;
  setupTime: string;
  maintenance: string;
}

export interface ImplementationGuide {
  domain: string;
  automations: ImplementationAutomation[];
}

export interface ImplementationOrder {
  week1_2: string[];
  week3_4: string[];
  month2: string[];
  month3plus: string[];
}

export interface ReportData {
  summary: string;
  automationMap: DomainAutomation[];
  topQuickWins: QuickWin[];
  implementationGuide: ImplementationGuide[];
  implementationOrder: ImplementationOrder;
}

// ─── Domain Metadata ──────────────────────────────────────────────────────────

const DOMAIN_NAMES: Record<number, string> = {
  1: "Primary Work / Career",
  2: "Side Hustle / Secondary Income",
  3: "Personal Finance",
  4: "Health & Fitness",
  5: "Personal Productivity & Daily Routines",
  6: "Communication & Relationships",
  7: "Home & Lifestyle",
  8: "Learning & Personal Development",
  9: "Content & Information Management",
};

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior AI automation strategist. A user has just completed a 9-domain life audit questionnaire. Based on their answers, you must deliver:

1. AUTOMATION MAP: For every task/workflow mentioned, identify automation opportunities.
2. IMPLEMENTATION GUIDE: For each opportunity, provide actionable steps.

Return a valid JSON object with this exact structure:
{
  "summary": "2-3 sentence overview of the user's automation profile",
  "automationMap": [
    {
      "domain": "Domain name",
      "domainNumber": 1,
      "opportunities": [
        {
          "task": "Specific task",
          "opportunity": "What AI can do",
          "timeSaved": "X hrs/week",
          "difficulty": "Easy|Medium|Hard",
          "cost": "Free|Low|Medium|High",
          "impact": "Low|Medium|High|Transformative"
        }
      ]
    }
  ],
  "topQuickWins": [
    {
      "rank": 1,
      "task": "Task name",
      "description": "Brief description of the win",
      "timeSaved": "X hrs/week"
    }
  ],
  "implementationGuide": [
    {
      "domain": "Domain name",
      "automations": [
        {
          "what": "The specific task being automated",
          "why": "The benefit and time savings",
          "tools": ["Tool 1", "Tool 2"],
          "steps": ["Step 1", "Step 2", "Step 3"],
          "proTip": "One insider tip",
          "setupTime": "X minutes/hours",
          "maintenance": "Ongoing effort needed"
        }
      ]
    }
  ],
  "implementationOrder": {
    "week1_2": ["Quick win descriptions"],
    "week3_4": ["Next steps"],
    "month2": ["Medium complexity"],
    "month3plus": ["Advanced automations"]
  }
}

Be specific. Reference the user's actual tools and workflows. Never invent tools that don't exist. Always include at least one free option. Return only the JSON object with no additional text.`;

// ─── Anthropic Singleton ──────────────────────────────────────────────────────

const globalForAnthropic = globalThis as unknown as { anthropic: Anthropic };

const anthropic =
  globalForAnthropic.anthropic ||
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}

// ─── Generate Report ──────────────────────────────────────────────────────────

export async function generateAuditReport(
  domainAnswers: Array<{ domain: number; answers: string }>
): Promise<ReportData> {
  const userPrompt = domainAnswers
    .sort((a, b) => a.domain - b.domain)
    .map((da) => {
      const domainName = DOMAIN_NAMES[da.domain] ?? `Domain ${da.domain}`;
      let parsed: unknown;
      try {
        parsed = JSON.parse(da.answers);
      } catch {
        parsed = da.answers;
      }
      return `## DOMAIN ${da.domain}: ${domainName}\n${JSON.stringify(parsed, null, 2)}`;
    })
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here are my 9-domain life audit answers. Please analyze them and provide my personalized automation roadmap:\n\n${userPrompt}`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  // Strip markdown code fences if present
  let raw = block.text.trim();
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) raw = fenceMatch[1];

  const data: ReportData = JSON.parse(raw);
  return data;
}
