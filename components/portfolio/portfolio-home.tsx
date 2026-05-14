import {
  EXPERIENCE,
  FEATURED,
  HERO,
  LEADERSHIP,
  LINKS,
  PROJECTS,
  SIGNALS,
  TECH_STACK,
} from "@/lib/portfolio-content"

function SectionTitle({
  id,
  eyebrow,
  title,
}: {
  id: string
  eyebrow: string
  title: string
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
    </div>
  )
}

function ExternalLink({
  href,
  children,
  className = "",
  sameTab,
}: {
  href: string
  children: React.ReactNode
  className?: string
  /** Use for mailto / same-window navigation */
  sameTab?: boolean
}) {
  if (sameTab) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  )
}

function PrimaryActions() {
  const base =
    "inline-flex items-center justify-center rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-3.5 py-2 font-mono text-xs text-[color:var(--foreground)] transition-colors hover:border-[color:var(--solar-dim)] hover:bg-[color:var(--surface-hover)] sm:text-[13px]"
  const accent =
    "inline-flex items-center justify-center rounded-md border border-[color:var(--solar-dim)] bg-[color-mix(in_oklab,var(--solar)_12%,transparent)] px-3.5 py-2 font-mono text-xs text-[color:var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--solar)_18%,transparent)] sm:text-[13px]"

  return (
    <div className="flex flex-wrap gap-2">
      <ExternalLink href={LINKS.resume} className={accent}>
        Resume ↗
      </ExternalLink>
      <ExternalLink href={LINKS.github} className={base}>
        GitHub ↗
      </ExternalLink>
      <ExternalLink href={LINKS.linkedin} className={base}>
        LinkedIn ↗
      </ExternalLink>
      <ExternalLink href={LINKS.email} sameTab className={base}>
        Contact
      </ExternalLink>
    </div>
  )
}

function ArchitectureDiagram() {
  return (
    <figure className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5">
      <svg viewBox="0 0 520 220" className="h-auto w-full" role="img">
        <title>Ingestion topology</title>
        <defs>
          <linearGradient id="solar-edge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--faint)" />
            <stop offset="50%" stopColor="var(--solar)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--faint)" />
          </linearGradient>
        </defs>
        <rect x="24" y="36" width="112" height="44" rx="8" fill="none" stroke="currentColor" className="text-[color:var(--line)]" strokeWidth="1.5" />
        <text x="80" y="62" textAnchor="middle" className="fill-[color:var(--muted)] font-mono text-[11px]">Producers</text>

        <rect x="204" y="28" width="112" height="60" rx="10" fill="none" stroke="var(--solar)" strokeOpacity="0.45" strokeWidth="1.5" />
        <text x="260" y="58" textAnchor="middle" className="fill-[color:var(--foreground)] font-mono text-[12px] font-medium">Kafka</text>
        <text x="260" y="76" textAnchor="middle" className="fill-[color:var(--muted)] font-mono text-[10px]">partitioned topics</text>

        <rect x="384" y="36" width="112" height="44" rx="8" fill="none" stroke="currentColor" className="text-[color:var(--line)]" strokeWidth="1.5" />
        <text x="440" y="62" textAnchor="middle" className="fill-[color:var(--muted)] font-mono text-[11px]">Consumers</text>

        <line x1="136" y1="58" x2="204" y2="58" stroke="url(#solar-edge)" strokeWidth="2" strokeLinecap="round" />
        <line x1="316" y1="58" x2="384" y2="58" stroke="url(#solar-edge)" strokeWidth="2" strokeLinecap="round" />

        <rect x="120" y="120" width="140" height="44" rx="8" fill="none" stroke="currentColor" className="text-[color:var(--line)]" strokeWidth="1.5" />
        <text x="190" y="147" textAnchor="middle" className="fill-[color:var(--muted)] font-mono text-[11px]">Schema registry</text>

        <rect x="292" y="120" width="120" height="44" rx="8" fill="none" stroke="currentColor" className="text-[color:var(--line)]" strokeWidth="1.5" />
        <text x="352" y="147" textAnchor="middle" className="fill-[color:var(--muted)] font-mono text-[11px]">DLQ + replay</text>

        <path d="M 260 88 L 260 108 L 190 108 L 190 120" fill="none" stroke="currentColor" className="text-[color:var(--line)]" strokeWidth="1.25" />
        <path d="M 260 88 L 260 108 L 352 108 L 352 120" fill="none" stroke="currentColor" className="text-[color:var(--line)]" strokeWidth="1.25" />

        <text x="260" y="200" textAnchor="middle" className="fill-[color:var(--muted)] font-mono text-[10px]">
          checkpoints · lag metrics · idempotent sinks
        </text>
      </svg>
    </figure>
  )
}

function HeroSection() {
  return (
    <section className="border-b border-[color:var(--line)] pb-12 pt-10 sm:pb-14 sm:pt-12" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
          {HERO.role}
        </p>
        <h1 id="hero-heading" className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="text-solar-gradient">{HERO.name}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)] sm:text-[15px]">
          {HERO.tagline}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] text-[color:var(--foreground)] sm:text-xs">
          {HERO.focus.map((item) => (
            <li
              key={item}
              className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-1"
            >
              {item}
            </li>
          ))}
        </ul>
        <ul className="mt-6 space-y-2 border-l border-[color:var(--solar-dim)] pl-4 text-sm leading-snug text-[color:var(--foreground)]">
          {HERO.credentials.map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li className="text-[color:var(--muted)]">{HERO.education}</li>
        </ul>
        <div className="mt-8">
          <PrimaryActions />
        </div>
      </div>
    </section>
  )
}

function FeaturedSection() {
  return (
    <section className="border-b border-[color:var(--line)] py-12 sm:py-16" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)]">Flagship</p>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <div className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-16">
            <ArchitectureDiagram />
            <p className="font-mono text-[11px] text-[color:var(--muted)]">
              Reference topology — swap in screenshots when you ship a public demo.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="featured-heading" className="text-2xl font-semibold tracking-tight">
                {FEATURED.title}
              </h2>
              <ExternalLink
                href={FEATURED.github}
                className="font-mono text-xs text-[color:var(--muted)] underline-offset-4 hover:text-[color:var(--foreground)] hover:underline"
              >
                Source ↗
              </ExternalLink>
            </div>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Systems depth first — architecture, tradeoffs, ops.</p>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] sm:text-[15px]">
              {FEATURED.summary}
            </p>
            <div className="mt-6 space-y-5 text-sm leading-relaxed">
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Problem
                </h3>
                <p className="mt-2 text-[color:var(--foreground)]">{FEATURED.problem}</p>
              </div>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Approach
                </h3>
                <p className="mt-2 text-[color:var(--foreground)]">{FEATURED.solution}</p>
              </div>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Architecture
                </h3>
                <ul className="mt-2 space-y-2 text-[color:var(--foreground)]">
                  {FEATURED.architecture.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="font-mono text-[color:var(--solar)]">/</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Engineering tradeoffs
                </h3>
                <ul className="mt-2 space-y-2 text-[color:var(--foreground)]">
                  {FEATURED.challenges.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--solar)]" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              {FEATURED.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-3"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {m.label}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-[color:var(--foreground)]">{m.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {FEATURED.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-[color:var(--line)] px-2 py-1 font-mono text-[11px] text-[color:var(--muted)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SignalStrip() {
  return (
    <section className="border-b border-[color:var(--line)] py-10 sm:py-12" aria-labelledby="stack-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionTitle id="stack-heading" eyebrow="Stack & signals" title="Tools I ship with — plus how I operate" />
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((t) => (
            <span
              key={t}
              className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-1 font-mono text-[11px] text-[color:var(--foreground)] sm:text-xs"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {SIGNALS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-[color:var(--line)] bg-[color-mix(in_oklab,var(--background)_40%,transparent)] px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {s.label}
              </p>
              <p className="mt-1 text-sm text-[color:var(--foreground)]">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectsSection() {
  return (
    <section className="border-b border-[color:var(--line)] py-12 sm:py-16" aria-labelledby="projects-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionTitle id="projects-heading" eyebrow="More builds" title="Additional projects — impact first" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <article
              key={p.title}
              className="flex flex-col rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold tracking-tight">{p.title}</h3>
                <ExternalLink
                  href={p.github}
                  className="shrink-0 font-mono text-[11px] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                >
                  ↗
                </ExternalLink>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[color:var(--muted)] sm:text-sm">{p.impact}</p>
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--foreground)] sm:text-[13px]">{p.depth}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-[color:var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  return (
    <section className="border-b border-[color:var(--line)] py-12 sm:py-16" aria-labelledby="experience-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionTitle id="experience-heading" eyebrow="Experience" title="Roles — concise" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <ul className="space-y-5">
              {EXPERIENCE.map((e) => (
                <li key={e.title} className="border-l border-[color:var(--line)] pl-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">{e.title}</p>
                    <span className="font-mono text-[11px] text-[color:var(--muted)]">{e.period}</span>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{e.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground)]">{e.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Leadership & community
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[color:var(--foreground)]">
              {LEADERSHIP.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[color:var(--solar)]">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="py-12 sm:py-16" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionTitle id="contact-heading" eyebrow="Contact" title="Let’s talk systems, teams, or products" />
        <p className="max-w-xl text-sm text-[color:var(--muted)]">
          Fastest path: email. Links below mirror the hero actions for thumb reach on mobile.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PrimaryActions />
          <p className="font-mono text-[11px] text-[color:var(--muted)]">
            Built with Next.js — static-first, minimal client JS.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function PortfolioHome() {
  return (
    <>
      <HeroSection />
      <FeaturedSection />
      <SignalStrip />
      <ProjectsSection />
      <ExperienceSection />
      <ContactSection />
    </>
  )
}
