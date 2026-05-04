"use client"

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import {
  Code2, Briefcase, Users, Compass, BookOpen, Mail,
} from "lucide-react"
import type { TimelineItem, Project } from "@/components/ui/radial-orbital-timeline"

const PROJECTS: Project[] = [
  {
    title: "ReachIQ",
    description: "AI-powered B2B outreach platform with personalized cold email generation.",
    intent: "Explore how LLMs change the shape of sales workflows.",
    tags: ["TypeScript", "Next.js", "OpenAI", "Postgres"],
    github: "https://github.com/devfiqi/reach-iq",
  },
  {
    title: "ScaleLab",
    description: "Hands-on system design tool for practicing real architecture tradeoffs.",
    intent: "Make systems learning concrete by letting people build, not just read.",
    tags: ["Go", "GCP", "gRPC"],
    github: "https://github.com/devfiqi/scalelab",
  },
  {
    title: "LogFlow",
    description: "Lightweight log aggregation service with structured query support.",
    intent: "Build observability tooling I'd actually want to use.",
    tags: ["Go", "Protobuf", "SQLite"],
    github: "https://github.com/devfiqi/logflow",
  },
  {
    title: "Distributed Log Ingestion",
    description: "Kafka-based log pipeline with exactly-once semantics and fault-tolerant consumers.",
    intent: "Understand production streaming infrastructure end to end.",
    tags: ["Kafka", "Java", "Avro"],
    github: "https://github.com/devfiqi/log-ingestion",
  },
]

const timelineData: TimelineItem[] = [

  /* ── INNER ORBIT — the headline ── */

  {
    id: 1,
    title: "Selected Work",
    date: "2024 — now",
    content: "A few projects I'm proud of — products, tools, and systems I built end to end. More on GitHub.",
    preview: "Things I've actually shipped",
    category: "Work",
    icon: Code2,
    relatedIds: [2, 4],
    status: "completed",
    energy: 100,
    orbit: 0,
    featured: true,
    projects: PROJECTS,
  },

  /* ── MID ORBIT — substance ── */

  {
    id: 2,
    title: "Where I've Worked",
    date: "2025 — 2026",
    content: "Hands-on engineering experience across product and infrastructure teams.",
    preview: "Roles, teams, and what I worked on",
    category: "Experience",
    icon: Briefcase,
    relatedIds: [1, 3],
    status: "in-progress",
    energy: 90,
    orbit: 1,
    bullets: [
      "Software Engineering Intern (incoming) — LinkedIn · Distributed Infrastructure",
      "Teaching Assistant — Stanford Code in Place",
    ],
  },
  {
    id: 3,
    title: "How I Lead",
    date: "Ongoing",
    content: "I lead by teaching, mentoring, and building communities where people grow into engineers.",
    preview: "Mentorship, teaching, community",
    category: "Leadership",
    icon: Users,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 80,
    orbit: 1,
    bullets: [
      "Founded a ColorStack chapter and led it as VP",
      "MLT Career Prep Fellow",
      "Student Mentor — CodePath",
      "Teaching Assistant — Stanford Code in Place",
    ],
  },
  {
    id: 4,
    title: "How I Think",
    date: "Always",
    content: "How I work, not what I work on. Capabilities I lean on across product, engineering, and leadership.",
    preview: "Capabilities, not tech stacks",
    category: "Capabilities",
    icon: Compass,
    relatedIds: [1, 3],
    status: "in-progress",
    energy: 85,
    orbit: 1,
    bullets: [
      "Build end-to-end — from problem framing to shipped system",
      "Translate complexity — explain hard ideas in plain language",
      "Systems thinking — find the leverage point, not just the bug",
      "Lead through teaching — clarity is leverage",
      "Learn fast — comfortable in ambiguous, unfamiliar spaces",
    ],
  },

  /* ── OUTER ORBIT — soft layer ── */

  {
    id: 5,
    title: "Currently",
    date: "Now",
    content: "What I'm reading, learning, and thinking about right now.",
    preview: "Reading, learning, side interests",
    category: "Now",
    icon: BookOpen,
    relatedIds: [4],
    status: "in-progress",
    energy: 65,
    orbit: 2,
    books: [
      { title: "Crime and Punishment",                 pct: 90 },
      { title: "Designing Data-Intensive Applications", pct: 70 },
      { title: "The Death of Ivan Ilyich",             pct: 55 },
    ],
    bookNotes: "Reading mostly fiction this season — Dostoevsky and Tolstoy on the literature side, DDIA on the engineering side. Fiction sharpens how I think about people; DDIA sharpens how I think about systems.",
  },
  {
    id: 6,
    title: "Get in Touch",
    date: "Open",
    content: "Always up for a conversation about systems, products, or anything in between.",
    preview: "GitHub, LinkedIn, email, resume",
    category: "Contact",
    icon: Mail,
    relatedIds: [1, 2],
    status: "pending",
    energy: 55,
    orbit: 2,
    links: [
      { label: "github",   url: "https://github.com/devfiqi" },
      { label: "linkedin", url: "https://linkedin.com/in/salmanfiqi" },
      { label: "resume",   url: "https://docs.google.com/document/d/1u6rH3CtSQ_VkhH52vUB_rYWaXJYu4WA-ipbYi3QihdI/edit?usp=sharing" },
      { label: "email",    url: "mailto:salmanfiqi@gmail.com" },
    ],
  },
]

export default function Home() {
  return (
    <RadialOrbitalTimeline
      timelineData={timelineData}
      centerName="Salman Fiqi"
      centerTagline="engineer · builder · leader"
    />
  )
}
