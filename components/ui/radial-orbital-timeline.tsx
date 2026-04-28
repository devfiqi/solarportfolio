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
  orbit?: 0 | 1 | 2
  /** Reading node: list of books with progress */
  books?: { title: string; pct: number }[]
  /** Contact node: external links */
  links?: { label: string; url: string }[]
}

interface Props {
  timelineData: TimelineItem[]
  centerName?: string
  centerTagline?: string
}

type AugmentedItem = TimelineItem & { orbit: 0 | 1 | 2; indexInOrbit: number }

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */

const ORBIT_RADII  = [160, 275, 390] as const   // px at scale=1
const ORBIT_SPEEDS = [30,   52,  80] as const   // seconds per revolution

const NODE_SIZE   = 48    // px
const CENTER_SIZE = 130   // px — large enough for a two-line name

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

/** Opacity-only depth — no blur, no scale variation. */
function getDepthOpacity(angleDeg: number): number {
  return 0.42 + 0.58 * ((Math.sin((angleDeg * Math.PI) / 180) + 1) / 2)
}

function getDepthZIndex(angleDeg: number): number {
  return Math.round(((Math.sin((angleDeg * Math.PI) / 180) + 1) / 2) * 40) + 4
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */

export default function RadialOrbitalTimeline({
  timelineData,
  centerName = "Salman Fiqi",
  centerTagline = "backend · infra",
}: Props) {

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

  /* id → title lookup for related-node labels */
  const titleById = React.useMemo(
    () => Object.fromEntries(timelineData.map((i) => [i.id, i.title])),
    [timelineData]
  )

  /* deduplicated graph edges */
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
  const [expandedId,   setExpandedId]   = useState<number | null>(null)
  const [expandedNodeX, setExpandedNodeX] = useState<number>(0)
  const [hoveredId,    setHoveredId]    = useState<number | null>(null)
  const [isPaused,     setIsPaused]     = useState(false)
  const [scale,        setScale]        = useState(1)

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
            : Math.max(10,  prev[item.id] - 0.06 * delta)
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
  const handleNodeClick = (id: number, nodeX: number) => {
    const isTogglingOff = expandedId === id
    setExpandedId(isTogglingOff ? null : id)
    if (!isTogglingOff) setExpandedNodeX(nodeX)
    setIsPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      lastTimeRef.current = 0
      setIsPaused(false)
    }, 10000)
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

  /* ── per-node positions ── */
  const positions = augmented.map((item) => {
    const count  = nodesPerOrbit[item.orbit] || 1
    const angle  = (orbitAngles[item.orbit] + (360 / count) * item.indexInOrbit) % 360
    const radius = getOrbitRadius(item.orbit, scale)
    const { x, y } = getNodePosition(angle, radius)
    return { id: item.id, angle, x, y }
  })
  const posById = Object.fromEntries(positions.map((p) => [p.id, p]))

  const canvasSize = (getOrbitRadius(2, scale) + 108) * 2
  const half       = canvasSize / 2

  /* ── render ── */
  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-black">

      {/* dot grid — very faint, gives "engineering tool" texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      {/* ── canvas ── */}
      <div className="relative flex-shrink-0" style={{ width: canvasSize, height: canvasSize }}>

        {/* orbit rings */}
        {ORBIT_RADII.map((baseR, level) => (
          <div key={level}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: baseR * scale * 2,
              height: baseR * scale * 2,
              left: "50%", top: "50%",
              transform: "translate(-50%,-50%)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          />
        ))}

        {/* graph edges */}
        <svg className="absolute pointer-events-none" style={{ inset: 0, width: "100%", height: "100%" }}>
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
                strokeOpacity={isHighlit ? 0.20 : 0.07}
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
            centerName={centerName}
            centerTagline={centerTagline}
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
                onClick={() => handleNodeClick(item.id, pos.x)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </div>
          )
        })}
      </div>

      {/* details panel — smart left/right placement to avoid covering nodes */}
      {expandedItem && (
        <DetailsPanel
          item={expandedItem}
          nodeX={expandedNodeX}
          titleById={titleById}
          onClose={handleClose}
        />
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
  isPaused, onToggle, activeItem, centerName, centerTagline, scale,
}: {
  isPaused: boolean
  onToggle: () => void
  activeItem: { title: string; category: string } | null
  centerName: string
  centerTagline: string
  scale: number
}) {
  const size = Math.round(CENTER_SIZE * Math.max(0.65, scale))

  return (
    <button onClick={onToggle} className="relative focus:outline-none group"
      style={{ width: size, height: size }}
      aria-label="Toggle orbit"
    >
      <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-white/20 transition-colors duration-200" />
      <div className="absolute rounded-full border border-white/[0.05]"
        style={{ inset: Math.round(size * 0.11) }}
      />
      <div className="absolute inset-0 rounded-full bg-black flex flex-col items-center justify-center gap-0.5 px-3">
        {activeItem ? (
          <>
            <span className="text-white/80 font-medium text-center leading-tight w-full truncate"
              style={{ fontSize: Math.max(9, Math.round(size * 0.105)) }}
            >
              {activeItem.title}
            </span>
            <span className="text-white/25 font-mono text-center"
              style={{ fontSize: Math.max(7, Math.round(size * 0.068)) }}
            >
              {activeItem.category}
            </span>
          </>
        ) : (
          <>
            <span className="text-white/70 font-medium text-center leading-tight w-full text-center"
              style={{ fontSize: Math.max(10, Math.round(size * 0.115)) }}
            >
              {centerName}
            </span>
            <span className="text-white/22 font-mono tracking-wide text-center"
              style={{ fontSize: Math.max(7, Math.round(size * 0.068)) }}
            >
              {isPaused ? "paused" : centerTagline}
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
    isExpanded ? "rgba(255,255,255,0.65)" :
    isRelated  ? "rgba(255,255,255,0.28)" :
    isHovered  ? "rgba(255,255,255,0.38)" :
                 "rgba(255,255,255,0.15)"

  const nodeScale = isExpanded ? 1.14 : isHovered ? 1.06 : 1

  return (
    <div className="relative flex items-center justify-center"
      style={{ width: nodeSize, height: nodeSize }}
    >
      {/* focus bar — thin line above node */}
      <div className="absolute pointer-events-none"
        style={{
          bottom: "100%", marginBottom: 6,
          width: nodeSize * 0.70, height: 2,
          left: "50%", transform: "translateX(-50%)",
          borderRadius: 1,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div style={{
          width: `${energy}%`, height: "100%",
          borderRadius: 1,
          background: isExpanded ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.20)",
          transition: "width 0.5s ease, background 0.25s ease",
        }} />
      </div>

      {/* node button */}
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
            ? "0 0 0 1px rgba(255,255,255,0.06), 0 4px 18px rgba(0,0,0,0.7)"
            : isHovered
            ? "0 2px 10px rgba(0,0,0,0.5)"
            : "none",
        }}
        aria-label={item.title}
      >
        {/* inner ring */}
        <div className="absolute rounded-full pointer-events-none"
          style={{
            inset: Math.round(nodeSize * 0.20),
            border: `1px solid ${isExpanded ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)"}`,
            transition: "border-color 0.22s ease",
          }}
        />
        {/* icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={Math.round(nodeSize * 0.30)}
            style={{
              color: isExpanded ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)",
              transition: "color 0.22s ease",
            }}
          />
        </div>
      </button>

      {/* label */}
      <span
        className="absolute whitespace-nowrap font-mono select-none pointer-events-none transition-colors duration-200"
        style={{
          top: "100%", marginTop: 7,
          fontSize: Math.max(9, Math.round(nodeSize * 0.205)),
          color: isExpanded ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.22)",
        }}
      >
        {item.title}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   DETAILS PANEL
   — placed left if the selected node is in the right half,
     right if it's in the left half, to avoid covering nodes
══════════════════════════════════════════════════════════ */

function DetailsPanel({
  item, nodeX, titleById, onClose,
}: {
  item: TimelineItem
  nodeX: number
  titleById: Record<number, string>
  onClose: () => void
}) {
  const Icon = item.icon
  /* node on right side → card goes left; node on left → card goes right */
  const cardOnLeft = nodeX > 60

  return (
    <div className={cn(
      "fixed z-40 pointer-events-auto",
      /* mobile: full-width bar at bottom */
      "bottom-4 left-3 right-3",
      /* sm+: side panel, vertically centered */
      cardOnLeft
        ? "sm:left-5 sm:right-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-72"
        : "sm:right-5 sm:left-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-72",
    )}>
      <div className="rounded-xl border border-white/10 bg-black/90 backdrop-blur-sm p-5 max-h-[80vh] overflow-y-auto">

        {/* header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/12 bg-black flex items-center justify-center flex-shrink-0">
              <Icon size={14} className="text-white/50" />
            </div>
            <div>
              <h3 className="text-white/85 font-medium text-sm leading-tight">{item.title}</h3>
              <span className="text-white/25 text-xs font-mono mt-0.5 block">{item.category}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="text-white/20 hover:text-white/55 transition-colors duration-150 text-base leading-none font-mono mt-0.5 ml-2"
            aria-label="Close"
          >×</button>
        </div>

        {/* date + status */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white/25 text-xs font-mono border border-white/8 rounded px-2 py-0.5">
            {item.date}
          </span>
          <span className={cn("text-xs font-mono", STATUS_COLOR[item.status])}>
            {STATUS_LABEL[item.status]}
          </span>
        </div>

        <div className="h-px bg-white/[0.06] mb-4" />

        {/* description */}
        <p className="text-white/50 text-sm leading-relaxed mb-4">{item.content}</p>

        {/* books (Reading node) */}
        {item.books && (
          <>
            <div className="h-px bg-white/[0.06] mb-4" />
            <span className="text-white/20 text-xs font-mono mb-3 block">currently reading</span>
            <div className="space-y-3">
              {item.books.map((book) => (
                <div key={book.title}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-white/45 text-xs leading-snug pr-3">{book.title}</span>
                    <span className="text-white/22 text-xs font-mono flex-shrink-0">{book.pct}%</span>
                  </div>
                  <div className="h-px bg-white/8">
                    <div className="h-full bg-white/28 transition-all duration-500"
                      style={{ width: `${book.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* links (Contact node) */}
        {item.links && (
          <>
            <div className="h-px bg-white/[0.06] mb-4" />
            <div className="space-y-0.5">
              {item.links.map((link) => (
                <a key={link.label} href={link.url}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between py-1.5 text-xs font-mono text-white/38 hover:text-white/70 transition-colors duration-150 group"
                >
                  <span>{link.label}</span>
                  <span className="text-white/18 group-hover:text-white/45 transition-colors">↗</span>
                </a>
              ))}
            </div>
          </>
        )}

        {/* focus bar */}
        <div className="mt-4">
          <div className="h-px bg-white/[0.06] mb-4" />
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/20 text-xs font-mono">focus</span>
            <span className="text-white/32 text-xs font-mono">{item.energy}%</span>
          </div>
          <div className="h-px bg-white/8 overflow-hidden rounded">
            <div className="h-full bg-white/38 rounded transition-all duration-500"
              style={{ width: `${item.energy}%` }}
            />
          </div>
        </div>

        {/* related nodes — shown by title, not #id */}
        {item.relatedIds.length > 0 && (
          <div className="mt-4">
            <div className="h-px bg-white/[0.06] mb-4" />
            <span className="text-white/18 text-xs font-mono mb-2 block">related</span>
            <div className="flex gap-1.5 flex-wrap">
              {item.relatedIds.map((id) => (
                <span key={id}
                  className="text-xs font-mono border border-white/8 text-white/28 rounded px-2 py-0.5"
                >
                  {titleById[id] ?? `#${id}`}
                </span>
              ))}
            </div>
          </div>
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
                height: Math.max(4, energy * 0.28),
                background: isActive ? "rgba(255,255,255,0.48)" : "rgba(255,255,255,0.14)",
              }}
            />
            <span className="font-mono" style={{ fontSize: 8, color: "rgba(255,255,255,0.12)" }}>
              {item.title.slice(0, 3).toUpperCase()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
