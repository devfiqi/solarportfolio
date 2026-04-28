"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */

export type NodeStatus = "completed" | "in-progress" | "pending"

export interface TimelineItem {
  id: number
  title: string
  date: string
  content: string
  category: string
  icon: LucideIcon
  relatedIds: number[]
  status: NodeStatus
  energy: number
  orbit?: 0 | 1 | 2   // 0 = inner, 1 = mid, 2 = outer; auto-assigned if omitted
}

interface Props {
  timelineData: TimelineItem[]
}

type AugmentedItem = TimelineItem & { orbit: 0 | 1 | 2; indexInOrbit: number }

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */

const ORBIT_RADII   = [155, 265, 375] as const   // px at scale=1
const ORBIT_SPEEDS  = [28,   50,  76] as const   // seconds per revolution

const NODE_SIZE    = 48   // uniform px
const CENTER_SIZE  = 112  // px

const STATUS_COLOR: Record<NodeStatus, string> = {
  completed:     "text-emerald-500",
  "in-progress": "text-amber-500",
  pending:       "text-zinc-500",
}
const STATUS_LABEL: Record<NodeStatus, string> = {
  completed:     "completed",
  "in-progress": "in progress",
  pending:       "pending",
}

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */

function getNodePosition(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius }
}

function getOrbitRadius(level: 0 | 1 | 2, scale: number): number {
  return ORBIT_RADII[level] * scale
}

/** Opacity-only depth — no blur, no scale tricks. */
function getDepthOpacity(angleDeg: number): number {
  return 0.40 + 0.60 * ((Math.sin((angleDeg * Math.PI) / 180) + 1) / 2)
}

function getDepthZIndex(angleDeg: number): number {
  return Math.round(((Math.sin((angleDeg * Math.PI) / 180) + 1) / 2) * 40) + 4
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */

export default function RadialOrbitalTimeline({ timelineData }: Props) {

  /* augment each item with orbit level + index within that orbit */
  const augmented = React.useMemo<AugmentedItem[]>(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
    return timelineData.map((item, i) => {
      const orbit = (item.orbit ?? (i % 3)) as 0 | 1 | 2
      const indexInOrbit = counts[orbit]
      counts[orbit]++
      return { ...item, orbit, indexInOrbit }
    })
  }, [timelineData])

  const nodesPerOrbit = React.useMemo(() => {
    const c: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
    augmented.forEach((a) => c[a.orbit]++)
    return c
  }, [augmented])

  /* deduplicated graph edges for connection lines */
  const edges = React.useMemo<[number, number][]>(() => {
    const seen = new Set<string>()
    const result: [number, number][] = []
    augmented.forEach((item) => {
      item.relatedIds.forEach((relId) => {
        const key = `${Math.min(item.id, relId)}-${Math.max(item.id, relId)}`
        if (!seen.has(key)) { seen.add(key); result.push([item.id, relId]) }
      })
    })
    return result
  }, [augmented])

  /* ── state ── */
  const [orbitAngles,  setOrbitAngles]  = useState<Record<number, number>>({ 0: 0, 1: 55, 2: 115 })
  const [energyLevels, setEnergyLevels] = useState<Record<number, number>>(
    () => Object.fromEntries(timelineData.map((item) => [item.id, item.energy]))
  )
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [hoveredId,  setHoveredId]  = useState<number | null>(null)
  const [isPaused,   setIsPaused]   = useState(false)
  const [scale,      setScale]      = useState(1)

  const rafRef      = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── responsive scale ── */
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      if      (w < 480)  setScale(0.36)
      else if (w < 640)  setScale(0.50)
      else if (w < 768)  setScale(0.64)
      else if (w < 1024) setScale(0.80)
      else               setScale(1.00)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  /* ── animation loop ── */
  const animate = useCallback((ts: number) => {
    if (!isPaused) {
      const delta = lastTimeRef.current ? (ts - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = ts

      setOrbitAngles((prev) => {
        const next = { ...prev }
        ORBIT_SPEEDS.forEach((speed, level) => {
          next[level] = (prev[level] + (360 / speed) * delta) % 360
        })
        return next
      })

      setEnergyLevels((prev) => {
        const next = { ...prev }
        timelineData.forEach((item) => {
          next[item.id] = item.id === expandedId
            ? Math.min(100, prev[item.id] + 1.2 * delta)
            : Math.max(10,  prev[item.id] - 0.07 * delta)
        })
        return next
      })
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [isPaused, expandedId, timelineData])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [animate])

  /* ── interaction ── */
  const handleNodeClick = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
    setIsPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      lastTimeRef.current = 0
      setIsPaused(false)
    }, 9000)
  }

  const handleClose = () => {
    setExpandedId(null)
    setIsPaused(false)
    lastTimeRef.current = 0
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }

  /* ── derived ── */
  const expandedItem = augmented.find((i) => i.id === expandedId) ?? null
  const relatedIds   = new Set(expandedItem?.relatedIds ?? [])
  const hoveredItem  = augmented.find((i) => i.id === hoveredId) ?? null

  /* ── per-node positions (6 trig ops per frame, no memo needed) ── */
  const positions = augmented.map((item) => {
    const count  = nodesPerOrbit[item.orbit] || 1
    const angle  = (orbitAngles[item.orbit] + (360 / count) * item.indexInOrbit) % 360
    const radius = getOrbitRadius(item.orbit, scale)
    const { x, y } = getNodePosition(angle, radius)
    return { id: item.id, angle, x, y }
  })
  const posById = Object.fromEntries(positions.map((p) => [p.id, p]))

  const canvasSize = (getOrbitRadius(2, scale) + 100) * 2
  const half       = canvasSize / 2

  /* ── render ── */
  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-black">

      {/* subtle dot-grid — gives engineering-tool feel without decoration */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      {/* very faint center radial to guide the eye */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 100%)",
      }} />

      {/* ── canvas ── */}
      <div className="relative flex-shrink-0" style={{ width: canvasSize, height: canvasSize }}>

        {/* orbit rings — extremely faint structural lines */}
        {ORBIT_RADII.map((baseR, level) => {
          const r = baseR * scale
          return (
            <div key={level}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: r * 2, height: r * 2,
                left: "50%", top: "50%",
                transform: "translate(-50%,-50%)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            />
          )
        })}

        {/* graph edges — always-on faint connection lines between related nodes */}
        <svg className="absolute pointer-events-none"
          style={{ inset: 0, width: "100%", height: "100%" }}
        >
          {edges.map(([aId, bId]) => {
            const a = posById[aId]
            const b = posById[bId]
            if (!a || !b) return null
            const isHighlit = aId === expandedId || bId === expandedId
                           || aId === hoveredId  || bId === hoveredId
            return (
              <line key={`${aId}-${bId}`}
                x1={half + a.x} y1={half + a.y}
                x2={half + b.x} y2={half + b.y}
                stroke="white"
                strokeWidth={isHighlit ? 1 : 0.5}
                strokeOpacity={isHighlit ? 0.18 : 0.07}
                strokeDasharray={isHighlit ? "none" : "3 5"}
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* center orb */}
        <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 60 }}>
          <CenterOrb
            isPaused={isPaused}
            onToggle={() => { setIsPaused((p) => !p); lastTimeRef.current = 0 }}
            activeItem={expandedItem ?? hoveredItem}
            scale={scale}
          />
        </div>

        {/* orbital nodes */}
        {augmented.map((item) => {
          const pos        = posById[item.id]
          if (!pos) return null
          const isExpanded = expandedId === item.id
          const isRelated  = relatedIds.has(item.id)
          const isHovered  = hoveredId  === item.id
          const energy     = energyLevels[item.id] ?? item.energy
          const opacity    = isExpanded || isRelated ? 1 : getDepthOpacity(pos.angle)

          return (
            <div key={item.id} className="absolute"
              style={{
                left: "50%", top: "50%",
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                zIndex: isExpanded ? 55 : getDepthZIndex(pos.angle),
                opacity,
                transition: isPaused ? "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              }}
            >
              <OrbitalNode
                item={item}
                isExpanded={isExpanded}
                isRelated={isRelated}
                isHovered={isHovered}
                energy={energy}
                nodeSize={NODE_SIZE * Math.max(0.70, scale)}
                onClick={() => handleNodeClick(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </div>
          )
        })}
      </div>

      {/* details panel — fixed, never overlaps orbit */}
      {expandedItem && (
        <DetailsPanel item={expandedItem} onClose={handleClose} />
      )}

      {/* energy meter */}
      <EnergyMeter items={timelineData} energyLevels={energyLevels} expandedId={expandedId} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   CENTER ORB
══════════════════════════════════════════════════════════ */

function CenterOrb({
  isPaused, onToggle, activeItem, scale,
}: {
  isPaused: boolean
  onToggle: () => void
  activeItem: { title: string; category: string } | null
  scale: number
}) {
  const size = Math.round(CENTER_SIZE * Math.max(0.65, scale))

  return (
    <button onClick={onToggle} className="relative focus:outline-none group"
      style={{ width: size, height: size }}
      aria-label="Toggle orbit"
    >
      {/* outer border */}
      <div className="absolute inset-0 rounded-full border border-white/12 group-hover:border-white/22 transition-colors duration-200" />
      {/* inner ring */}
      <div className="absolute rounded-full border border-white/6"
        style={{ inset: Math.round(size * 0.12) }}
      />
      {/* face */}
      <div className="absolute inset-0 rounded-full bg-black flex flex-col items-center justify-center gap-0.5">
        {activeItem ? (
          <>
            <span className="text-white/85 font-medium text-center leading-tight px-3"
              style={{ fontSize: Math.max(9, Math.round(size * 0.11)) }}
            >
              {activeItem.title}
            </span>
            <span className="text-white/28 font-mono text-center"
              style={{ fontSize: Math.max(7, Math.round(size * 0.072)) }}
            >
              {activeItem.category}
            </span>
          </>
        ) : (
          <>
            <span className="text-white/75 font-mono font-medium tracking-widest"
              style={{ fontSize: Math.max(10, Math.round(size * 0.135)) }}
            >
              SF
            </span>
            <span className="text-white/22 font-mono tracking-wider"
              style={{ fontSize: Math.max(7, Math.round(size * 0.072)) }}
            >
              {isPaused ? "PAUSED" : "SYS"}
            </span>
          </>
        )}
      </div>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════
   ORBITAL NODE
══════════════════════════════════════════════════════════ */

interface OrbitalNodeProps {
  item: AugmentedItem
  isExpanded: boolean
  isRelated:  boolean
  isHovered:  boolean
  energy:     number
  nodeSize:   number
  onClick:      () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function OrbitalNode({
  item, isExpanded, isRelated, isHovered, energy, nodeSize,
  onClick, onMouseEnter, onMouseLeave,
}: OrbitalNodeProps) {
  const Icon = item.icon

  const borderColor =
    isExpanded  ? "rgba(255,255,255,0.60)" :
    isRelated   ? "rgba(255,255,255,0.30)" :
    isHovered   ? "rgba(255,255,255,0.35)" :
                  "rgba(255,255,255,0.16)"

  const nodeScale =
    isExpanded ? 1.14 :
    isHovered  ? 1.06 : 1

  return (
    <div className="relative flex items-center justify-center"
      style={{ width: nodeSize, height: nodeSize }}
    >
      {/* energy bar — thin line above node */}
      <div className="absolute pointer-events-none"
        style={{
          bottom: "100%", marginBottom: 6,
          width: nodeSize * 0.72, height: 2,
          left: "50%", transform: "translateX(-50%)",
          borderRadius: 1,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div style={{
          width: `${energy}%`, height: "100%",
          borderRadius: 1,
          background: isExpanded ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.22)",
          transition: "width 0.5s ease, background 0.25s ease",
        }} />
      </div>

      {/* node */}
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="relative w-full h-full rounded-full bg-black focus:outline-none"
        style={{
          border: `1px solid ${borderColor}`,
          transform: `scale(${nodeScale})`,
          transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
          boxShadow: isExpanded
            ? "0 0 0 1px rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.7)"
            : isHovered
            ? "0 2px 10px rgba(0,0,0,0.5)"
            : "none",
        }}
        aria-label={item.title}
      >
        {/* inner ring — the nested circle */}
        <div className="absolute rounded-full pointer-events-none"
          style={{
            inset: Math.round(nodeSize * 0.20),
            border: `1px solid ${isExpanded ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)"}`,
            transition: "border-color 0.22s ease",
          }}
        />
        {/* icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon
            size={Math.round(nodeSize * 0.30)}
            style={{
              color: isExpanded ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.45)",
              transition: "color 0.22s ease",
            }}
          />
        </div>
      </button>

      {/* label */}
      <span
        className="absolute whitespace-nowrap font-mono select-none pointer-events-none transition-colors duration-200"
        style={{
          top: "100%",
          marginTop: 7,
          fontSize: Math.max(9, Math.round(nodeSize * 0.21)),
          color: isExpanded ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
        }}
      >
        {item.title}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   DETAILS PANEL
══════════════════════════════════════════════════════════ */

function DetailsPanel({ item, onClose }: { item: TimelineItem; onClose: () => void }) {
  const Icon = item.icon
  return (
    <div className={cn(
      "fixed z-40 pointer-events-auto",
      "bottom-4 left-3 right-3",
      "sm:left-auto sm:right-5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-72",
    )}>
      <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-sm p-5">

        {/* header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/15 bg-black flex items-center justify-center flex-shrink-0">
              <Icon size={14} className="text-white/55" />
            </div>
            <div>
              <h3 className="text-white/88 font-medium text-sm leading-tight">{item.title}</h3>
              <span className="text-white/28 text-xs font-mono mt-0.5 block">{item.category}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="text-white/20 hover:text-white/55 transition-colors duration-150 text-base leading-none font-mono mt-0.5"
            aria-label="Close"
          >×</button>
        </div>

        {/* meta row */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white/28 text-xs font-mono border border-white/10 rounded px-2 py-0.5">
            {item.date}
          </span>
          <span className={cn("text-xs font-mono", STATUS_COLOR[item.status])}>
            {STATUS_LABEL[item.status]}
          </span>
        </div>

        <div className="h-px bg-white/6 mb-4" />

        {/* description */}
        <p className="text-white/52 text-sm leading-relaxed mb-5">{item.content}</p>

        {/* energy bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/25 text-xs font-mono">energy</span>
            <span className="text-white/38 text-xs font-mono">{item.energy}%</span>
          </div>
          <div className="h-px bg-white/8 overflow-hidden rounded">
            <div className="h-full bg-white/40 rounded transition-all duration-500"
              style={{ width: `${item.energy}%` }}
            />
          </div>
        </div>

        {/* related nodes */}
        {item.relatedIds.length > 0 && (
          <>
            <div className="h-px bg-white/6 mb-4" />
            <span className="text-white/20 text-xs font-mono mb-2.5 block">related</span>
            <div className="flex gap-1.5 flex-wrap">
              {item.relatedIds.map((id) => (
                <span key={id}
                  className="text-xs font-mono border border-white/8 text-white/28 rounded px-2 py-0.5"
                >
                  #{id}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ENERGY METER
══════════════════════════════════════════════════════════ */

function EnergyMeter({
  items, energyLevels, expandedId,
}: {
  items: TimelineItem[]
  energyLevels: Record<number, number>
  expandedId: number | null
}) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-2.5 z-10">
      {items.map((item) => {
        const energy   = energyLevels[item.id] ?? item.energy
        const isActive = expandedId === item.id
        return (
          <div key={item.id} className="flex flex-col items-center gap-1">
            <div className="w-px rounded-full transition-all duration-500"
              style={{
                height: Math.max(4, energy * 0.30),
                background: isActive ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.16)",
              }}
            />
            <span className="font-mono" style={{ fontSize: 8, color: "rgba(255,255,255,0.14)" }}>
              {item.title.slice(0, 3).toUpperCase()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
