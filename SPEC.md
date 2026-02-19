# Life Audit App — Build Spec

## Overview
A SaaS web app where users go through a 9-domain AI Life Audit questionnaire. Claude processes their answers and generates a personalized automation roadmap (Phase 2: Automation Map + Phase 3: Implementation Guide). The report is saved to the DB, downloadable as PDF, and emailable to the user. An admin dashboard lets the owner view all users and reports.

## Tech Stack
- Next.js 14 (App Router, src/ directory, TypeScript)
- Tailwind CSS
- Prisma v5 + SQLite (dev.db already migrated)
- NextAuth v4 with Prisma adapter (credentials provider: email/password)
- @anthropic-ai/sdk for Claude API
- @react-pdf/renderer for PDF generation
- resend for email
- bcryptjs for password hashing

## Database Models (already in prisma/schema.prisma, already migrated)
- User: id, email, name, password, role (user|admin), createdAt
- Account, Session, VerificationToken (NextAuth)
- AuditSession: id, userId, status (in_progress|generating|completed|failed), currentDomain (1-9), createdAt, completedAt
- AuditResponse: id, auditSessionId, domain (1-9), answers (JSON string), createdAt
- AuditReport: id, auditSessionId, automationMap (JSON), implGuide (JSON), pdfPath, emailedAt, createdAt

## Environment Variables (.env.local already exists)
- DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY, RESEND_API_KEY, ADMIN_EMAIL

## Port
Run on port 3003 (npm run dev -- -p 3003)

---

## MODULE 1: Auth + Layout (DONE — just wire it)
- /auth/signin — email/password login form
- /auth/signup — register form (name, email, password)
- Layout with nav: logo, "My Reports", Sign out (when authed); Sign in / Get Started (when not)
- Middleware: protect /audit/* and /dashboard/* and /admin/* routes
- Admin check: user.role === "admin"

## MODULE 2: Questionnaire (9-domain multi-step)
### Route: /audit (redirects to /audit/[sessionId] on start)
### Route: /audit/[sessionId]

Flow:
1. User lands on /audit, clicks "Start Audit" — creates AuditSession in DB, redirects to /audit/[sessionId]
2. Multi-step form: one domain at a time (currentDomain 1-9)
3. Each domain has 3-5 questions shown as a conversational form
4. Answers saved to AuditResponse (per domain) on "Next" — PATCH /api/audit/[sessionId]/response
5. Progress bar showing domain X of 9
6. After domain 9 confirmed, show summary of all answers, "Generate My Report" button
7. On generate: POST /api/audit/[sessionId]/generate — sets status="generating", triggers Claude

### Domain Questions (hardcode these):

DOMAIN 1: Primary Work / Career
- What is your job title and industry? How large is your company/team?
- Walk me through a typical workday — what are the first things you do and what eats most of your time?
- What software/tools do you use daily? (email, project management, CRM, spreadsheets, comms apps, etc.)
- What tasks do you hate but have to do? What would you most want to delegate?
- How do you handle client or stakeholder communication? Any reporting responsibilities?

DOMAIN 2: Side Hustle / Secondary Income
- Do you have any side projects, freelance work, content creation, or other income streams?
- If yes: what does it involve day-to-day? What tools do you use? What's the biggest bottleneck?
- How do you acquire clients or grow your audience (if applicable)?

DOMAIN 3: Personal Finance
- How do you currently manage budgeting and expense tracking?
- How do you handle bill payments, subscriptions, investments?
- Do you have a process for taxes, financial goal tracking, or debt management?

DOMAIN 4: Health & Fitness
- What does your exercise routine look like? Do you track it?
- How do you handle meal planning and nutrition?
- Do you track sleep, supplements, or have regular health appointments to manage?

DOMAIN 5: Personal Productivity & Daily Routines
- Describe your morning and evening routines.
- How do you manage tasks and your calendar? What system do you use (or wish you had)?
- How do you take notes and manage your knowledge/information?

DOMAIN 6: Communication & Relationships
- How do you manage personal email? Is inbox overwhelm a problem?
- How do you stay on top of important dates (birthdays, anniversaries, events)?
- Any family coordination challenges or networking/relationship maintenance that feels manual?

DOMAIN 7: Home & Lifestyle
- How do you handle grocery shopping, home maintenance, and household admin?
- Do you use any smart home devices? What home tasks feel most repetitive?
- How do you plan and book travel?

DOMAIN 8: Learning & Personal Development
- What are you currently trying to learn or develop?
- How do you consume content (books, podcasts, articles) and retain what you learn?
- Do you have a system for career development or skill tracking?

DOMAIN 9: Content & Information Management
- How do you stay current in your industry or areas of interest?
- Do you have a research workflow? How do you save and revisit articles/ideas?
- What information feels overwhelming or hard to keep up with?

## MODULE 3: Claude Integration + Report Generation
### POST /api/audit/[sessionId]/generate

1. Load all AuditResponses for the session
2. Build a comprehensive prompt using the AUDIT_PROMPT below
3. Call Claude claude-opus-4-5 (or claude-sonnet-4-5 if opus unavailable)
4. Parse the JSON response
5. Save to AuditReport (automationMap + implGuide as JSON)
6. Update AuditSession status to "completed"
7. Optionally trigger PDF generation

### THE AUDIT PROMPT (system prompt):
```
You are a senior AI automation strategist. A user has just completed a 9-domain life audit questionnaire. Based on their answers, you must deliver:

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

Be specific. Reference the user's actual tools and workflows. Never invent tools that don't exist. Always include at least one free option.
```

## MODULE 4: PDF Generation + Email
### GET /api/report/[reportId]/pdf — generate and return PDF
### POST /api/report/[reportId]/email — send report PDF to user's email

PDF structure:
- Cover page: "Your AI Life Audit Report", user name, date
- Executive Summary
- Automation Map (tables per domain)
- Top 10 Quick Wins
- Implementation Guide (sections per domain)
- Implementation Timeline

Email (via Resend):
- From: noreply@[domain] or use test mode
- Subject: "Your AI Life Audit Report is ready"
- Body: brief intro + download link
- Attachment: PDF

## MODULE 5: Admin Dashboard
### Route: /admin (protected, role=admin only)

Pages:
- /admin — overview stats (total users, total reports, reports this week)
- /admin/users — table: name, email, role, joined date, # reports, actions
- /admin/reports — table: user, started, completed, status, actions (view, download PDF, email)
- /admin/reports/[reportId] — full report view (automation map + implementation guide rendered nicely)

## MODULE 6: User Dashboard
### Route: /dashboard

- List of user's AuditSessions with status
- Link to continue in-progress audits
- Link to view/download completed reports
- "Start New Audit" button

---

## Design Guidelines
- Color scheme: Dark navy + electric blue/cyan accents (professional, techy)
- Font: System font stack
- Components: Keep it clean, no clutter
- Mobile: Must be responsive
- Loading states: Show progress spinners on Claude generation (it takes 30-60 seconds)

## Seed Admin User
Create a seed script at prisma/seed.ts:
- Creates admin user: email=matt@fuelvm.com, password=fvm2026!, role=admin
- Run with: npx prisma db seed

## When Done
Run: openclaw system event --text "Done: life-audit-app module [NAME] complete" --mode now
