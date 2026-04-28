"use client"

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import {
  Network, Database, Server,
  Code2, Briefcase,
  Users, BookOpen, Mail,
} from "lucide-react"
import type { TimelineItem } from "@/components/ui/radial-orbital-timeline"

const timelineData: TimelineItem[] = [

  /* ── INNER ORBIT — core technical domains ── */

  {
    id: 1,
    title: "Dist. Systems",
    date: "Core",
    content: "Kafka pipelines, exactly-once delivery, distributed log ingestion, streaming architecture, consensus and replication.",
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
    content: "ReachIQ — AI-powered B2B outreach platform. ScaleLab — distributed backend infrastructure. Distributed Log Ingestion — Kafka pipeline with exactly-once semantics and fault-tolerant consumers.",
    category: "Engineering",
    icon: Code2,
    relatedIds: [1, 2, 3, 5],
    status: "completed",
    energy: 100,
    orbit: 1,
  },
  {
    id: 5,
    title: "Experience",
    date: "2025",
    content: "Incoming Software Engineering Intern at LinkedIn — Distributed Infrastructure team. Working on large-scale production systems serving hundreds of millions of users.",
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
    content: "Founder of a ColorStack chapter — growing a community of Black and Latinx CS students in tech. MLT Career Prep Fellow.",
    category: "Community",
    icon: Users,
    relatedIds: [5],
    status: "in-progress",
    energy: 65,
    orbit: 2,
  },
  {
    id: 7,
    title: "Reading",
    date: "Current",
    content: "Technical books on distributed systems and databases alongside literature.",
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
  },
  {
    id: 8,
    title: "Contact",
    date: "Open",
    content: "Available for internships, research collaborations, and technical conversations.",
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
      centerTagline="backend · infra"
    />
  )
}
