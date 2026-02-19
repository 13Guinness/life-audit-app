export interface Domain {
  id: number
  name: string
  icon: string
  description: string
  questions: string[]
}

export const DOMAINS: Domain[] = [
  {
    id: 1,
    name: "Primary Work / Career",
    icon: "💼",
    description: "Let's start with your main professional life and where your work time goes.",
    questions: [
      "What is your job title and industry? How large is your company/team?",
      "Walk me through a typical workday — what are the first things you do and what eats most of your time?",
      "What software/tools do you use daily? (email, project management, CRM, spreadsheets, comms apps, etc.)",
      "What tasks do you hate but have to do? What would you most want to delegate?",
      "How do you handle client or stakeholder communication? Any reporting responsibilities?",
    ],
  },
  {
    id: 2,
    name: "Side Hustle / Secondary Income",
    icon: "🚀",
    description: "Tell me about any side projects or additional income streams you're managing.",
    questions: [
      "Do you have any side projects, freelance work, content creation, or other income streams?",
      "If yes: what does it involve day-to-day? What tools do you use? What's the biggest bottleneck?",
      "How do you acquire clients or grow your audience (if applicable)?",
    ],
  },
  {
    id: 3,
    name: "Personal Finance",
    icon: "💰",
    description: "Let's look at how you manage your money and financial life.",
    questions: [
      "How do you currently manage budgeting and expense tracking?",
      "How do you handle bill payments, subscriptions, investments?",
      "Do you have a process for taxes, financial goal tracking, or debt management?",
    ],
  },
  {
    id: 4,
    name: "Health & Fitness",
    icon: "🏃",
    description: "Tell me about your health routines and how you track them.",
    questions: [
      "What does your exercise routine look like? Do you track it?",
      "How do you handle meal planning and nutrition?",
      "Do you track sleep, supplements, or have regular health appointments to manage?",
    ],
  },
  {
    id: 5,
    name: "Personal Productivity & Daily Routines",
    icon: "⚡",
    description: "Walk me through how you structure your day and manage your time.",
    questions: [
      "Describe your morning and evening routines.",
      "How do you manage tasks and your calendar? What system do you use (or wish you had)?",
      "How do you take notes and manage your knowledge/information?",
    ],
  },
  {
    id: 6,
    name: "Communication & Relationships",
    icon: "💬",
    description: "How you stay connected with the people who matter and manage your inbox.",
    questions: [
      "How do you manage personal email? Is inbox overwhelm a problem?",
      "How do you stay on top of important dates (birthdays, anniversaries, events)?",
      "Any family coordination challenges or networking/relationship maintenance that feels manual?",
    ],
  },
  {
    id: 7,
    name: "Home & Lifestyle",
    icon: "🏠",
    description: "The day-to-day logistics of running your home and personal life.",
    questions: [
      "How do you handle grocery shopping, home maintenance, and household admin?",
      "Do you use any smart home devices? What home tasks feel most repetitive?",
      "How do you plan and book travel?",
    ],
  },
  {
    id: 8,
    name: "Learning & Personal Development",
    icon: "📚",
    description: "How you invest in growing your skills and knowledge.",
    questions: [
      "What are you currently trying to learn or develop?",
      "How do you consume content (books, podcasts, articles) and retain what you learn?",
      "Do you have a system for career development or skill tracking?",
    ],
  },
  {
    id: 9,
    name: "Content & Information Management",
    icon: "🗂️",
    description: "How you handle the flood of information and content in your life.",
    questions: [
      "How do you stay current in your industry or areas of interest?",
      "Do you have a research workflow? How do you save and revisit articles/ideas?",
      "What information feels overwhelming or hard to keep up with?",
    ],
  },
]
