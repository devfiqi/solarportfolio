"use client"

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import {
  Network, Database, Server,
  Code2, Briefcase,
  Users, BookOpen, Mail,
} from "lucide-react"
import type { TimelineItem, Project } from "@/components/ui/radial-orbital-timeline"

const PROJECTS: Project[] = [
  {
    title: "ReachIQ",
    description: "AI-powered B2B outreach platform with personalized cold email generation",
    intent: "Explore LLM integration in sales automation pipelines",
    tags: ["TypeScript", "Next.js", "OpenAI", "Postgres"],
    github: "https://github.com/devfiqi/reach-iq",
  },
  {
    title: "ScaleLab",
    description: "Distributed backend infrastructure platform for system design practice",
    intent: "Understand system design tradeoffs through real implementation",
    tags: ["Go", "GCP", "gRPC", "Kafka"],
    github: "https://github.com/devfiqi/scalelab",
  },
  {
    title: "Distributed Log Ingestion",
    description: "Kafka-based log pipeline with exactly-once semantics and fault-tolerant consumers",
    intent: "Build production-grade streaming infrastructure from scratch",
    tags: ["Kafka", "Java", "Avro", "ZooKeeper"],
    github: "https://github.com/devfiqi/log-ingestion",
  },
  {
    title: "PostgreSQL Optimizer",
    description: "Query plan analyzer that surfaces slow queries and suggests index strategies",
    intent: "Learn query internals by building on top of pg_stat",
    tags: ["PostgreSQL", "Python", "SQL"],
    github: "https://github.com/devfiqi/pg-optimizer",
  },
  {
    title: "KV Store",
    description: "Persistent key-value store with WAL, MVCC, and crash recovery",
    intent: "Implement storage engine fundamentals end-to-end",
    tags: ["C++", "LSM", "WAL", "MVCC"],
    github: "https://github.com/devfiqi/kv-store",
  },
  {
    title: "Rate Limiter",
    description: "Token bucket and sliding window rate limiter with Redis backend",
    intent: "Build distributed rate limiting as a standalone service",
    tags: ["Go", "Redis", "gRPC"],
    github: "https://github.com/devfiqi/rate-limiter",
  },
  {
    title: "LogFlow",
    description: "Lightweight log aggregation service with structured query support",
    intent: "Understand observability infrastructure from first principles",
    tags: ["Go", "Protobuf", "SQLite"],
    github: "https://github.com/devfiqi/logflow",
  },
  {
    title: "LSM Tree",
    description: "Log-Structured Merge-Tree implementation with compaction and bloom filters",
    intent: "Implement the storage engine behind LevelDB and RocksDB",
    tags: ["Rust", "LSM", "Bloom Filter"],
    github: "https://github.com/devfiqi/lsm-tree",
  },
]

const timelineData: TimelineItem[] = [

  /* ── INNER ORBIT — core technical domains ── */

  {
    id: 1,
    title: "Dist. Systems",
    date: "Core",
    content: "Kafka pipelines, exactly-once delivery, distributed log ingestion, streaming architecture, consensus and replication.",
    preview: "Kafka, logs, streaming, consensus",
    category: "Systems",
    icon: Network,
    relatedIds: [2, 3, 4, 5],
    status: "in-progress",
    energy: 95,
    orbit: 0,
  },
  {
    id: 2,
    title: "Databases",
    date: "Core",
    content: "Query optimization, B-trees and LSM-trees, storage internals, indexing strategies, MVCC, and transaction systems.",
    preview: "Query optimization, indexing, storage internals",
    category: "Systems",
    icon: Database,
    relatedIds: [1, 3, 7],
    status: "in-progress",
    energy: 90,
    orbit: 0,
  },
  {
    id: 3,
    title: "Infrastructure",
    date: "Core",
    content: "GCP, rate limiting, API design, distributed coordination, high-throughput backend services.",
    preview: "GCP, APIs, distributed coordination",
    category: "Systems",
    icon: Server,
    relatedIds: [1, 2, 4, 5],
    status: "in-progress",
    energy: 85,
    orbit: 0,
  },

  /* ── MID ORBIT — work and projects ── */

  {
    id: 4,
    title: "Projects",
    date: "Selected",
    content: "Eight backend and distributed systems projects spanning storage engines, streaming pipelines, rate limiting, and AI tooling.",
    preview: "Things I've actually built",
    category: "Engineering",
    icon: Code2,
    relatedIds: [1, 2, 3, 5],
    status: "completed",
    energy: 100,
    orbit: 1,
    featured: true,
    projects: PROJECTS,
  },
  {
    id: 5,
    title: "Experience",
    date: "2025",
    content: "Incoming Software Engineering Intern at LinkedIn — Distributed Infrastructure team. Working on large-scale production systems serving hundreds of millions of users.",
    preview: "LinkedIn, Distributed Infrastructure",
    category: "Career",
    icon: Briefcase,
    relatedIds: [1, 3, 4, 6],
    status: "in-progress",
    energy: 80,
    orbit: 1,
  },

  /* ── OUTER ORBIT — community, learning, contact ── */

  {
    id: 6,
    title: "Leadership",
    date: "Ongoing",
    content: "Mentorship, teaching, and community leadership across CS education and professional development.",
    preview: "Teaching, mentorship, and community",
    category: "Community",
    icon: Users,
    relatedIds: [5],
    status: "in-progress",
    energy: 65,
    orbit: 2,
    bullets: [
      "Founder / VP — ColorStack Chapter",
      "MLT Career Prep Fellow",
      "Student Mentor — CodePath",
      "Teaching Assistant — Stanford Code in Place",
    ],
  },
  {
    id: 7,
    title: "Reading",
    date: "Current",
    content: "Technical books on distributed systems and databases alongside literature.",
    preview: "Current books + systems notes",
    category: "Learning",
    icon: BookOpen,
    relatedIds: [1, 2],
    status: "in-progress",
    energy: 70,
    orbit: 2,
    books: [
      { title: "Designing Data-Intensive Applications", pct: 70 },
      { title: "Streaming Systems",                    pct: 20 },
      { title: "Database Internals",                   pct: 10 },
      { title: "Crime and Punishment",                 pct: 90 },
      { title: "The Death of Ivan Ilyich",             pct: 5  },
    ],
    bookNotes: "Focus: storage internals, consensus, and replication — connecting systems theory to implementation. DDIA is the most useful technical book I've read. Streaming Systems fills the gaps on exactly-once semantics.",
  },
  {
    id: 8,
    title: "Contact",
    date: "Open",
    content: "Available for internships, research collaborations, and technical conversations.",
    preview: "GitHub, LinkedIn, email, resume",
    category: "Connect",
    icon: Mail,
    relatedIds: [5, 6],
    status: "pending",
    energy: 50,
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
      centerTagline="backend · distributed systems · infra"
    />
  )
}
