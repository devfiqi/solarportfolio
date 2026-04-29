"use client"

import React, {
  useState, useEffect, useCallback, useRef, useContext, useMemo,
} from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */

export type NodeStatus = "completed" | "in-progress" | "pending"

export interface Project {
  title: string
  description: string
  intent: string
  tags: string[]
  github?: string
  live?: string
}

export interface TimelineItem {
  id: number
  title: string
  date: string
  content: string
  preview?: string
  category: string
  icon: LucideIcon
  relatedIds: number[]
  status: NodeStatus
  energy: number
  orbit?: 0 | 1 | 2
  featured?: boolean
  books?: { title: string; pct: number }[]
  bookNotes?: string
  links?: { label: string; url: string }[]
  projects?: Project[]
  bullets?: string[]
}

interface Props {
  timelineData: TimelineItem[]
  centerName?: string
  centerTagline?: string
}

type AugmentedItem = TimelineItem & { orbit: 0 | 1 | 2; indexInOrbit: number }

type ViewMode = "orbit" | "system"

/* ══════════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════════ */

interface Theme {
  isDark: boolean
  fg: (op: number) => string
  bg: (op: number) => string
  canvas: string
  surface: string
}

function buildTheme(isDark: boolean): Theme {
  return {
    isDark,
    fg: (op) => isDark ? `rgba(255,255,255,${op})` : `rgba(0,0,0,${op})`,
    bg: (op) => isDark ? `rgba(0,0,0,${op})` : `rgba(255,255,255,${op})`,
    canvas: isDark ? "#000" : "#fff",
    surface: isDark ? "rgba(0,0,0,0.92)" : "rgba(255,255,255,0.96)",
  }
}

const ThemeCtx = React.createContext<Theme>(buildTheme(true))

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */

const ORBIT_RADII  = [160, 275, 390] as const
const ORBIT_SPEEDS = [30,   52,  80] as const

const NODE_SIZE   = 48
const CENTER_SIZE = 130

const RESUME_URL   = "https://docs.google.com/document/d/1u6rH3CtSQ_VkhH52vUB_rYWaXJYu4WA-ipbYi3QihdI/edit"
const GITHUB_URL   = "https://github.com/devfiqi"
const LINKEDIN_URL = "https://linkedin.com/in/salmanfiqi"

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

// Base angles for system view — spreads each orbit's nodes cleanly
const SYSTEM_BASE_ANGLES: Record<number, number> = { 0: 0, 1: 60, 2: 30 }

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

// Min opacity 0.75 so no node is ever too dim to read
function getDepthOpacity(angleDeg: number): number {
  return 0.75 + 0.25 * ((Math.sin((angleDeg * Math.PI) / 180) + 1) / 2)
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
  centerTagline = "backend · distributed systems · infra",
}: Props) {

  /* ── augment items with orbit index ── */
  const augmented = useMemo<AugmentedItem[]>(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
    return timelineData.map((item, i) => {
      const orbit = (item.orbit ?? (i % 3)) as 0 | 1 | 2
      const indexInOrbit = counts[orbit]
      counts[orbit]++
      return { ...item, orbit, indexInOrbit }
    })
  }, [timelineData])

  const nodesPerOrbit = useMemo(() => {
    const c: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
    augmented.forEach((a) => c[a.orbit]++)
    return c
  }, [augmented])

  const titleById = useMemo(
    () => Object.fromEntries(timelineData.map((i) => [i.id, i.title])),
    [timelineData]
  )

  const edges = useMemo<[number, number][]>(() => {
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

  /* ── theme ── */
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    if (localStorage.getItem("portfolio-theme") === "light") {
      setIsDark(false)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem("portfolio-theme", next ? "dark" : "light")
      document.documentElement.classList.toggle("light", !next)
      return next
    })
  }, [])

  const theme = useMemo(() => buildTheme(isDark), [isDark])

  /* ── view mode ── */
  const [viewMode, setViewMode] = useState<ViewMode>("orbit")

  const toggleView = useCallback(() => {
    setViewMode((prev) => {
      if (prev === "orbit") {
        setOrbitAngles(SYSTEM_BASE_ANGLES)
        return "system"
      }
      return "orbit"
    })
  }, [])

  /* ── core animation state ── */
  const [orbitAngles,   setOrbitAngles]   = useState<Record<number, number>>({ 0: 0, 1: 55, 2: 115 })
  const [energyLevels,  setEnergyLevels]  = useState<Record<number, number>>(
    () => Object.fromEntries(timelineData.map((item) => [item.id, item.energy]))
  )
  const [expandedId,    setExpandedId]    = useState<number | null>(null)
  const [expandedNodeX, setExpandedNodeX] = useState<number>(0)
  const [hoveredId,     setHoveredId]     = useState<number | null>(null)
  const [isPaused,      setIsPaused]      = useState(false)
  const [scale,         setScale]         = useState(1)

  /* ── command palette state ── */
  const [cmdOpen,    setCmdOpen]    = useState(false)
  const [cmdQuery,   setCmdQuery]   = useState("")
  const [cmdIndex,   setCmdIndex]   = useState(0)

  const openCmd = useCallback(() => {
    setCmdOpen(true); setCmdQuery(""); setCmdIndex(0)
  }, [])

  const commands = useMemo(() => [
    { label: "Open Projects",      action: () => { setExpandedId(4); setCmdOpen(false) } },
    { label: "Open Experience",    action: () => { setExpandedId(5); setCmdOpen(false) } },
    { label: "Open Reading",       action: () => { setExpandedId(7); setCmdOpen(false) } },
    { label: "Open Resume",        action: () => { window.open(RESUME_URL, "_blank"); setCmdOpen(false) } },
    { label: "Open GitHub",        action: () => { window.open(GITHUB_URL, "_blank"); setCmdOpen(false) } },
    { label: "Open LinkedIn",      action: () => { window.open(LINKEDIN_URL, "_blank"); setCmdOpen(false) } },
    { label: "Toggle Light Mode",  action: () => { toggleTheme(); setCmdOpen(false) } },
    { label: "Toggle System View", action: () => { toggleView(); setCmdOpen(false) } },
  ], [toggleTheme, toggleView])

  const filteredCommands = useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(cmdQuery.toLowerCase())),
    [commands, cmdQuery]
  )

  /* ── refs ── */
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

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((p) => !p); setCmdQuery(""); setCmdIndex(0)
        return
      }
      if (e.key === "/" && !cmdOpen && tag !== "INPUT") {
        e.preventDefault()
        openCmd(); return
      }
      if (e.key === "Escape") {
        if (cmdOpen) { setCmdOpen(false); return }
        if (expandedId !== null) {
          setExpandedId(null); setIsPaused(false); lastTimeRef.current = 0
          if (resumeTimer.current) clearTimeout(resumeTimer.current)
        }
        return
      }
      if (cmdOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setCmdIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setCmdIndex((i) => Math.max(i - 1, 0))
        } else if (e.key === "Enter") {
          e.preventDefault()
          filteredCommands[cmdIndex]?.action()
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [cmdOpen, cmdIndex, filteredCommands, expandedId, openCmd])

  /* ── animation loop ── */
  const animate = useCallback((ts: number) => {
    const delta = lastTimeRef.current ? (ts - lastTimeRef.current) / 1000 : 0
    lastTimeRef.current = ts

    if (!isPaused && viewMode === "orbit") {
      setOrbitAngles((prev) => {
        const next = { ...prev }
        ORBIT_SPEEDS.forEach((speed, level) => {
          next[level] = (prev[level] + (360 / speed) * delta) % 360
        })
        return next
      })
    }

    if (!isPaused) {
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
  }, [isPaused, viewMode, expandedId, timelineData])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [animate])

  /* ── interaction ── */
  const handleNodeClick = (id: number, nodeX: number) => {
    const togglingOff = expandedId === id
    setExpandedId(togglingOff ? null : id)
    if (!togglingOff) setExpandedNodeX(nodeX)
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
    <ThemeCtx.Provider value={theme}>
      <div
        className="relative flex items-center justify-center w-full min-h-screen overflow-hidden"
        style={{ backgroundColor: theme.canvas }}
      >
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)"
            : "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* ── orbital canvas ── */}
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
                border: `1px solid ${theme.fg(0.10)}`,
              }}
            />
          ))}

          {/* graph edges */}
          <svg className="absolute pointer-events-none" suppressHydrationWarning style={{ inset: 0, width: "100%", height: "100%" }}>
            {edges.map(([aId, bId]) => {
              const a = posById[aId]
              const b = posById[bId]
              if (!a || !b) return null
              const isHighlit = aId === expandedId || bId === expandedId
                             || aId === hoveredId  || bId === hoveredId
              const opacity     = viewMode === "system" ? (isHighlit ? 0.40 : 0.25) : (isHighlit ? 0.30 : 0.18)
              const dashArray   = viewMode === "system" || isHighlit ? undefined : "3 5"
              const strokeWidth = viewMode === "system" ? 1 : (isHighlit ? 1 : 0.5)
              const r = (n: number) => Math.round(n * 100) / 100
              return (
                <line key={`${aId}-${bId}`}
                  x1={r(half + a.x)} y1={r(half + a.y)}
                  x2={r(half + b.x)} y2={r(half + b.y)}
                  stroke={isDark ? "white" : "black"}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeDasharray={dashArray}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>

          {/* center orb */}
          <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 60 }}>
            <CenterOrb
              isPaused={isPaused}
              viewMode={viewMode}
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
            const opacity    = Math.round((isExpanded || isRelated ? 1 : getDepthOpacity(pos.angle)) * 1000) / 1000

            const rx = Math.round(pos.x * 100) / 100
            const ry = Math.round(pos.y * 100) / 100
            return (
              <div key={item.id} className="absolute"
                suppressHydrationWarning
                style={{
                  left: "50%", top: "50%",
                  transform: `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px))`,
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
                  nodeSize={NODE_SIZE * Math.max(0.70, scale) * (item.featured ? 1.2 : 1)}
                  onClick={() => handleNodeClick(item.id, pos.x)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </div>
            )
          })}
        </div>

        {/* details panel */}
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

        {/* top-right controls */}
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 items-end">
          <ControlButton label={isDark ? "light" : "dark"} onClick={toggleTheme} title="Toggle theme" />
          <ControlButton label={viewMode === "orbit" ? "system" : "orbit"} onClick={toggleView} title="Toggle view" />
          <ControlButton label="⌘K" onClick={openCmd} title="Command palette" />
        </div>

        {/* resume button — always visible, bottom-right */}
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 font-mono text-xs px-3 py-1.5 rounded border transition-colors cursor-pointer"
          style={{
            color: theme.fg(0.55),
            borderColor: theme.fg(0.18),
            backgroundColor: theme.bg(0.65),
          }}
        >
          resume ↗
        </a>

        {/* command palette */}
        {cmdOpen && (
          <CommandPalette
            query={cmdQuery}
            setQuery={(q) => { setCmdQuery(q); setCmdIndex(0) }}
            activeIndex={cmdIndex}
            setActiveIndex={setCmdIndex}
            commands={filteredCommands}
            onClose={() => setCmdOpen(false)}
          />
        )}
      </div>
    </ThemeCtx.Provider>
  )
}

/* ══════════════════════════════════════════════════════════
   CONTROL BUTTON (theme / view / cmd)
══════════════════════════════════════════════════════════ */

function ControlButton({ label, onClick, title }: { label: string; onClick: () => void; title: string }) {
  const { fg, bg } = useContext(ThemeCtx)
  return (
    <button
      onClick={onClick}
      title={title}
      className="font-mono text-xs px-2.5 py-1.5 rounded border cursor-pointer transition-colors"
      style={{ color: fg(0.55), borderColor: fg(0.18), backgroundColor: bg(0.65) }}
    >
      {label}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════
   CENTER ORB
══════════════════════════════════════════════════════════ */

function CenterOrb({
  isPaused, viewMode, onToggle, activeItem, centerName, centerTagline, scale,
}: {
  isPaused: boolean
  viewMode: ViewMode
  onToggle: () => void
  activeItem: { title: string; category: string; preview?: string } | null
  centerName: string
  centerTagline: string
  scale: number
}) {
  const { fg } = useContext(ThemeCtx)
  const size = Math.round(CENTER_SIZE * Math.max(0.65, scale))

  const tagline = viewMode === "system" ? "system view"
    : isPaused ? "paused"
    : centerTagline

  return (
    <button onClick={onToggle} className="relative focus:outline-none cursor-pointer"
      style={{ width: size, height: size }}
      aria-label="Toggle orbit"
    >
      <div className="absolute inset-0 rounded-full transition-colors duration-200"
        style={{ border: `1px solid ${fg(0.15)}` }}
      />
      <div className="absolute rounded-full"
        style={{ inset: Math.round(size * 0.11), border: `1px solid ${fg(0.06)}` }}
      />
      <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-0.5 px-3">
        {activeItem ? (
          <>
            <span className="font-medium text-center leading-tight w-full truncate"
              style={{ fontSize: Math.max(9, Math.round(size * 0.105)), color: fg(0.88) }}
            >
              {activeItem.title}
            </span>
            <span className="font-mono text-center"
              style={{ fontSize: Math.max(7, Math.round(size * 0.068)), color: fg(0.40) }}
            >
              {activeItem.preview ?? activeItem.category}
            </span>
          </>
        ) : (
          <>
            <span className="font-medium text-center leading-tight w-full"
              style={{ fontSize: Math.max(10, Math.round(size * 0.115)), color: fg(0.82) }}
            >
              {centerName}
            </span>
            <span className="font-mono tracking-wide text-center"
              style={{ fontSize: Math.max(7, Math.round(size * 0.068)), color: fg(0.32) }}
            >
              {tagline}
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
  const { fg } = useContext(ThemeCtx)
  const Icon = item.icon

  const borderColor =
    isExpanded ? fg(0.72) :
    isRelated  ? fg(0.48) :
    isHovered  ? fg(0.58) :
                 fg(0.32)

  const nodeScale = isExpanded ? 1.14 : isHovered ? 1.06 : 1

  return (
    <div className="relative flex items-center justify-center"
      style={{ width: nodeSize, height: nodeSize }}
    >
      {/* energy bar above node */}
      <div className="absolute pointer-events-none"
        style={{
          bottom: "100%", marginBottom: 6,
          width: nodeSize * 0.70, height: 2,
          left: "50%", transform: "translateX(-50%)",
          borderRadius: 1,
          background: fg(0.08),
          overflow: "hidden",
        }}
      >
        <div style={{
          width: `${energy}%`, height: "100%",
          borderRadius: 1,
          background: isExpanded ? fg(0.62) : fg(0.35),
          transition: "width 0.5s ease, background 0.25s ease",
        }} />
      </div>

      {/* node button */}
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="relative w-full h-full rounded-full focus:outline-none cursor-crosshair"
        style={{
          border: `1px solid ${borderColor}`,
          backgroundColor: "transparent",
          transform: `scale(${nodeScale})`,
          transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
          boxShadow: isExpanded
            ? `0 0 0 1px ${fg(0.06)}, 0 4px 18px rgba(0,0,0,0.5)`
            : isHovered
            ? "0 2px 10px rgba(0,0,0,0.3)"
            : "none",
        }}
        aria-label={item.title}
      >
        {/* inner ring */}
        <div className="absolute rounded-full pointer-events-none"
          style={{
            inset: Math.round(nodeSize * 0.20),
            border: `1px solid ${isExpanded ? fg(0.22) : fg(0.08)}`,
            transition: "border-color 0.22s ease",
          }}
        />
        {/* icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={Math.round(nodeSize * 0.30)}
            style={{
              color: isExpanded ? fg(0.92) : fg(0.68),
              transition: "color 0.22s ease",
            }}
          />
        </div>
      </button>

      {/* label */}
      <span
        className="absolute whitespace-nowrap font-mono select-none pointer-events-none"
        style={{
          top: "100%", marginTop: 7,
          fontSize: Math.max(9, Math.round(nodeSize * 0.205)),
          color: isExpanded ? fg(0.88) : fg(0.70),
          transition: "color 0.22s ease",
        }}
      >
        {item.title}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   DETAILS PANEL
   Left if node is in right half, right if in left half.
══════════════════════════════════════════════════════════ */

function DetailsPanel({
  item, nodeX, titleById, onClose,
}: {
  item: TimelineItem
  nodeX: number
  titleById: Record<number, string>
  onClose: () => void
}) {
  const { fg, surface } = useContext(ThemeCtx)
  const Icon = item.icon
  const cardOnLeft = nodeX > 60
  const [notesOpen, setNotesOpen] = useState(false)

  const divider = <div className="h-px my-4" style={{ background: fg(0.08) }} />

  return (
    <div className={cn(
      "fixed z-40 pointer-events-auto",
      "bottom-4 left-3 right-3",
      cardOnLeft
        ? "sm:left-5 sm:right-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-72"
        : "sm:right-5 sm:left-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:w-72",
    )}>
      <div className="rounded-xl backdrop-blur-sm p-5 max-h-[80vh] overflow-y-auto"
        style={{ border: `1px solid ${fg(0.12)}`, backgroundColor: surface }}
      >

        {/* header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ border: `1px solid ${fg(0.15)}` }}
            >
              <Icon size={14} style={{ color: fg(0.55) }} />
            </div>
            <div>
              <h3 className="font-medium text-sm leading-tight" style={{ color: fg(0.90) }}>{item.title}</h3>
              <span className="text-xs font-mono mt-0.5 block" style={{ color: fg(0.32) }}>{item.category}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="text-base leading-none font-mono mt-0.5 ml-2 cursor-pointer"
            style={{ color: fg(0.28) }}
            onMouseEnter={(e) => { e.currentTarget.style.color = fg(0.65) }}
            onMouseLeave={(e) => { e.currentTarget.style.color = fg(0.28) }}
            aria-label="Close"
          >×</button>
        </div>

        {/* date + status */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono rounded px-2 py-0.5"
            style={{ color: fg(0.35), border: `1px solid ${fg(0.10)}` }}
          >
            {item.date}
          </span>
          <span className={cn("text-xs font-mono", STATUS_COLOR[item.status])}>
            {STATUS_LABEL[item.status]}
          </span>
        </div>

        {divider}

        {/* description */}
        <p className="text-sm leading-relaxed" style={{ color: fg(0.62) }}>{item.content}</p>

        {/* bullets — Leadership */}
        {item.bullets && (
          <>
            {divider}
            <ul className="space-y-2">
              {item.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs" style={{ color: fg(0.58) }}>
                  <span style={{ color: fg(0.28), marginTop: 1 }}>—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* projects — Projects node */}
        {item.projects && (
          <>
            {divider}
            <span className="text-xs font-mono block mb-4" style={{ color: fg(0.28) }}>selected projects</span>
            <div className="space-y-6">
              {item.projects.map((proj) => (
                <div key={proj.title}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium" style={{ color: fg(0.88) }}>{proj.title}</h4>
                    <div className="flex gap-3 flex-shrink-0 ml-2">
                      {proj.github && (
                        <a href={proj.github} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-mono cursor-pointer"
                          style={{ color: fg(0.38) }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = fg(0.72) }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = fg(0.38) }}
                        >gh ↗</a>
                      )}
                      {proj.live && (
                        <a href={proj.live} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-mono cursor-pointer"
                          style={{ color: fg(0.38) }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = fg(0.72) }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = fg(0.38) }}
                        >live ↗</a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-1" style={{ color: fg(0.58) }}>{proj.description}</p>
                  <p className="text-xs italic mb-2" style={{ color: fg(0.38) }}>intent: {proj.intent}</p>
                  <div className="flex gap-1 flex-wrap">
                    {proj.tags.map((tag) => (
                      <span key={tag}
                        className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ color: fg(0.45), border: `1px solid ${fg(0.12)}` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* books — Reading node */}
        {item.books && (
          <>
            {divider}
            <span className="text-xs font-mono mb-3 block" style={{ color: fg(0.28) }}>currently reading</span>
            <div className="space-y-3">
              {item.books.map((book) => (
                <div key={book.title}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-xs leading-snug pr-3" style={{ color: fg(0.58) }}>{book.title}</span>
                    <span className="text-xs font-mono flex-shrink-0" style={{ color: fg(0.32) }}>{book.pct}%</span>
                  </div>
                  <div className="h-px overflow-hidden" style={{ background: fg(0.10) }}>
                    <div className="h-full transition-all duration-500"
                      style={{ width: `${book.pct}%`, background: fg(0.38) }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* expandable reading notes */}
            {item.bookNotes && (
              <div className="mt-4">
                <button
                  onClick={() => setNotesOpen((n) => !n)}
                  className="text-xs font-mono cursor-pointer flex items-center gap-1"
                  style={{ color: fg(0.32) }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = fg(0.62) }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = fg(0.32) }}
                >
                  notes {notesOpen ? "↑" : "↓"}
                </button>
                {notesOpen && (
                  <p className="text-xs leading-relaxed mt-2" style={{ color: fg(0.52) }}>
                    {item.bookNotes}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* links — Contact node */}
        {item.links && (
          <>
            {divider}
            <div className="space-y-0.5">
              {item.links.map((link) => (
                <a key={link.label} href={link.url}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between py-1.5 text-xs font-mono cursor-pointer"
                  style={{ color: fg(0.48) }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = fg(0.82) }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = fg(0.48) }}
                >
                  <span>{link.label}</span>
                  <span style={{ color: fg(0.25) }}>↗</span>
                </a>
              ))}
            </div>
          </>
        )}

        {/* focus bar */}
        <div className="mt-4">
          {divider}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono" style={{ color: fg(0.28) }}>focus</span>
            <span className="text-xs font-mono" style={{ color: fg(0.42) }}>{item.energy}%</span>
          </div>
          <div className="h-px overflow-hidden rounded" style={{ background: fg(0.10) }}>
            <div className="h-full rounded transition-all duration-500"
              style={{ width: `${item.energy}%`, background: fg(0.48) }}
            />
          </div>
        </div>

        {/* related nodes */}
        {item.relatedIds.length > 0 && (
          <div className="mt-4">
            {divider}
            <span className="text-xs font-mono mb-2 block" style={{ color: fg(0.22) }}>related</span>
            <div className="flex gap-1.5 flex-wrap">
              {item.relatedIds.map((id) => (
                <span key={id}
                  className="text-xs font-mono rounded px-2 py-0.5"
                  style={{ color: fg(0.38), border: `1px solid ${fg(0.10)}` }}
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
  const { fg } = useContext(ThemeCtx)

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
                background: isActive ? fg(0.52) : fg(0.20),
              }}
            />
            <span className="font-mono" style={{ fontSize: 8, color: fg(0.18) }}>
              {item.title.slice(0, 3).toUpperCase()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   COMMAND PALETTE
══════════════════════════════════════════════════════════ */

function CommandPalette({
  query, setQuery, activeIndex, setActiveIndex, commands, onClose,
}: {
  query: string
  setQuery: (q: string) => void
  activeIndex: number
  setActiveIndex: (i: number) => void
  commands: { label: string; action: () => void }[]
  onClose: () => void
}) {
  const { fg, surface } = useContext(ThemeCtx)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-80 rounded-xl overflow-hidden backdrop-blur-sm"
        style={{ border: `1px solid ${fg(0.14)}`, backgroundColor: surface }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* input */}
        <div className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: `1px solid ${fg(0.08)}` }}
        >
          <span style={{ color: fg(0.30), fontSize: 12 }}>⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search commands..."
            className="flex-1 bg-transparent outline-none text-sm font-mono"
            style={{ color: fg(0.82) }}
          />
        </div>

        {/* list */}
        <div className="py-1.5 max-h-60 overflow-y-auto">
          {commands.length === 0 ? (
            <p className="px-4 py-3 text-xs font-mono" style={{ color: fg(0.32) }}>no results</p>
          ) : (
            commands.map((cmd, i) => (
              <button
                key={cmd.label}
                onClick={cmd.action}
                onMouseEnter={() => setActiveIndex(i)}
                className="w-full text-left px-4 py-2.5 text-sm font-mono cursor-pointer"
                style={{
                  color: activeIndex === i ? fg(0.92) : fg(0.58),
                  backgroundColor: activeIndex === i ? fg(0.05) : "transparent",
                }}
              >
                {cmd.label}
              </button>
            ))
          )}
        </div>

        {/* footer */}
        <div className="px-4 py-2 flex gap-3"
          style={{ borderTop: `1px solid ${fg(0.06)}` }}
        >
          {["↑↓ navigate", "↵ select", "esc close"].map((hint) => (
            <span key={hint} className="text-xs font-mono" style={{ color: fg(0.22) }}>{hint}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
