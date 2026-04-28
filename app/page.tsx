"use client"

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import { Code, Briefcase, Database, Network, Cpu, Mail } from "lucide-react"
import type { TimelineItem } from "@/components/ui/radial-orbital-timeline"

const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: "Projects",
    date: "Featured",
    content: "Distributed systems, databases, backend infrastructure, and performance-heavy engineering projects.",
    category: "Portfolio",
    icon: Code,
    relatedIds: [2, 3, 4],
    status: "completed",
    energy: 100,
    orbit: 1,   // mid ring
  },
  {
    id: 2,
    title: "Experience",
    date: "2026",
    content: "Backend infrastructure experience focused on scalable systems and production engineering.",
    category: "Career",
    icon: Briefcase,
    relatedIds: [1, 3],
    status: "in-progress",
    energy: 90,
    orbit: 1,   // mid ring
  },
  {
    id: 3,
    title: "Systems",
    date: "Focus",
    content: "Databases, storage engines, distributed systems, networking, and operating systems.",
    category: "Skills",
    icon: Network,
    relatedIds: [1, 2, 5],
    status: "completed",
    energy: 95,
    orbit: 0,   // inner ring
  },
  {
    id: 4,
    title: "Databases",
    date: "Core",
    content: "Query optimization, LSM trees, storage internals, indexing, and transaction systems.",
    category: "Technical",
    icon: Database,
    relatedIds: [1, 3],
    status: "completed",
    energy: 95,
    orbit: 0,   // inner ring
  },
  {
    id: 5,
    title: "Infra",
    date: "Backend",
    content: "Rate limiting, messaging systems, distributed coordination, and high-throughput services.",
    category: "Technical",
    icon: Cpu,
    relatedIds: [1, 3, 6],
    status: "in-progress",
    energy: 85,
    orbit: 2,   // outer ring
  },
  {
    id: 6,
    title: "Contact",
    date: "Open",
    content: "Resume, GitHub, LinkedIn, and email links.",
    category: "Contact",
    icon: Mail,
    relatedIds: [2, 5],
    status: "pending",
    energy: 70,
    orbit: 2,   // outer ring
  },
]

export default function Home() {
  return <RadialOrbitalTimeline timelineData={timelineData} />
}
