/** Single source of truth for homepage copy and links. */

export const LINKS = {
  resume:
    "https://docs.google.com/document/d/1u6rH3CtSQ_VkhH52vUB_rYWaXJYu4WA-ipbYi3QihdI/edit?usp=sharing",
  github: "https://github.com/devfiqi",
  linkedin: "https://linkedin.com/in/salmanfiqi",
  email: "mailto:salmanfiqi@gmail.com",
} as const

export const HERO = {
  name: "Salman Fiqi",
  role: "Software Engineer",
  tagline:
    "Backend systems, data infrastructure, and AI-adjacent tooling — shipped with tight feedback loops and production discipline.",
  focus: ["Distributed systems", "AI tooling", "Scalable product surfaces"],
  credentials: [
    "Incoming SWE Intern @ LinkedIn — Distributed Infrastructure",
    "VP @ ColorStack",
    "Teaching Assistant @ Stanford Code in Place",
  ],
  /** Add your school line when you want it public, e.g. `CS @ …` */
  education: "Computer Science (undergraduate)",
} as const

export const FEATURED = {
  title: "Distributed Log Ingestion",
  summary:
    "End-to-end streaming pipeline for high-volume logs with deterministic recovery paths, schema evolution, and consumer coordination under failure.",
  problem:
    "Ingestion needs to stay correct when brokers bounce, consumers lag, and producers emit partial batches. Naive at-least-once delivery duplicates work downstream.",
  solution:
    "Kafka-backed pipeline with idempotent writers, consumer checkpoints, and replay-safe handlers so operators can reprocess windows without corrupting aggregates.",
  architecture: [
    "Partitioned topics with keyed routing for hot tenants",
    "Consumer groups with cooperative rebalancing and backpressure",
    "Avro schemas versioned for forward-compatible evolution",
    "Dead-letter path for poison records + manual replay hooks",
  ],
  metrics: [
    { label: "Fault model", value: "Broker / consumer / producer restarts" },
    { label: "Delivery stance", value: "At-least-once + idempotent sinks" },
    { label: "Observability", value: "Lag, offset gaps, DLQ depth" },
  ],
  stack: ["Kafka", "Java", "Avro", "Docker", "JUnit"],
  challenges: [
    "Exactly-once semantics are expensive; chose pragmatic at-least-once with dedupe at the sink where it mattered.",
    "Tuned batching vs latency for bursty producers without starving low-priority streams.",
  ],
  github: "https://github.com/devfiqi/log-ingestion",
} as const

export const TECH_STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Java",
  "Python",
  "Go",
  "AWS",
  "PostgreSQL",
  "Redis",
  "Kafka",
  "gRPC",
] as const

export const SIGNALS = [
  { label: "Scope", value: "Full-stack ownership on infra-heavy projects" },
  { label: "Reliability", value: "Checkpointing, retries, and replay tooling" },
  { label: "Interfaces", value: "APIs and CLIs engineers actually use" },
  { label: "Leadership", value: "ColorStack chapter + CodePath mentorship" },
] as const

export const PROJECTS = [
  {
    title: "ReachIQ",
    impact:
      "Outbound workflow engine with templated generation, rate limits, and audit trails for sensitive copy.",
    depth:
      "LLM calls isolated behind adapters; Postgres as source of truth for campaign state and approvals.",
    stack: ["TypeScript", "Next.js", "OpenAI", "Postgres"],
    github: "https://github.com/devfiqi/reach-iq",
  },
  {
    title: "ScaleLab",
    impact:
      "Interactive system design drills — tradeoff prompts, capacity math, and failure exercises instead of passive reading.",
    depth:
      "Go services on GCP with gRPC between components to keep boundaries explicit while staying fast to iterate.",
    stack: ["Go", "GCP", "gRPC"],
    github: "https://github.com/devfiqi/scalelab",
  },
  {
    title: "LogFlow",
    impact:
      "Structured log store with queryable fields and small-footprint deployment for side projects and labs.",
    depth:
      "Protobuf on the wire, SQLite for local persistence, and a query surface biased toward grep-like ergonomics.",
    stack: ["Go", "Protobuf", "SQLite"],
    github: "https://github.com/devfiqi/logflow",
  },
] as const

export const EXPERIENCE = [
  {
    title: "LinkedIn",
    role: "Software Engineering Intern (incoming)",
    detail: "Distributed Infrastructure — shipping and operating systems at scale.",
    period: "2026",
  },
  {
    title: "Stanford / Code in Place",
    role: "Teaching Assistant",
    detail: "Introductory CS — debugging sessions, rubrics, and empathetic technical communication.",
    period: "2025",
  },
] as const

export const LEADERSHIP = [
  "Founded a ColorStack chapter; serve as VP — programs, partnerships, and member growth.",
  "MLT Career Prep Fellow — recruiting systems, interview loops, and offer negotiation.",
  "Student Mentor @ CodePath — project structure, code review, and career navigation.",
] as const
